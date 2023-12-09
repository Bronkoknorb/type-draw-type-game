package net.czedik.hermann.tdt;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.regex.Pattern;

import org.apache.commons.lang3.RandomStringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import net.czedik.hermann.tdt.GameLoader.GameRef;
import net.czedik.hermann.tdt.actions.AccessAction;
import net.czedik.hermann.tdt.actions.JoinAction;
import net.czedik.hermann.tdt.actions.TypeAction;
import net.czedik.hermann.tdt.playerstate.UnknownGameState;

@Service
public class GameManager {
    private static final Logger log = LoggerFactory.getLogger(GameManager.class);

    private static final String CHARACTERS_WITHOUT_AMBIGUOUS = "23456789abcdefghijkmnpqrstuvwxyz";
    private static final int GAME_ID_LENGTH = 5;
    private static final Pattern gameIdPattern = Pattern
            .compile("[" + CHARACTERS_WITHOUT_AMBIGUOUS + "]{" + GAME_ID_LENGTH + "}");

    // guarded by this
    private final Map<String, GameLoader> gameLoaders = new HashMap<>();

    // guarded by this
    private final Map<Client, GameRef> clientToGameRef = new HashMap<>();

    private final Path gamesPath;

    public GameManager(@Value("${storage.dir}") String storageDir) {
        Path storageDirPath = Path.of(storageDir).toAbsolutePath().normalize();
        log.info("Using storage path: {}", storageDirPath);
        gamesPath = storageDirPath.resolve("games");
    }

    public String newGame(CreateGameRequest createGameRequest) throws IOException {
        String gameId = generateAndReserveNewGameId();
        Path gameDir = getGameDir(gameId);
        Player player = new Player(createGameRequest.playerId(), createGameRequest.playerName(),
                createGameRequest.playerFace(), true);
        Game newGame = new Game(gameId, gameDir, player);

        GameRef gameRef = getGameRef(gameId);
        try {
            gameRef.setNewGame(newGame);
        } finally {
            closeGameRef(gameRef);
        }

        return newGame.gameId;
    }

    public void handleAccessAction(Client client, AccessAction accessAction) {
        handleAccessOrJoinAction(client, game -> game.access(client, accessAction), accessAction.gameId());
    }

    public void handleJoinAction(Client client, JoinAction joinAction) {
        handleAccessOrJoinAction(client, game -> game.join(client, joinAction), joinAction.gameId());
    }

    private void handleAccessOrJoinAction(Client client, Function<Game, Boolean> actionHandler, String gameId) {
        validateGameId(gameId);

        GameRef gameRef = getGameRef(gameId);
        boolean added = false;
        try {
            added = gameRef.useGame(game -> {
                if (game == null) {
                    handleGameUnknown(client);
                    return false;
                }
                return actionHandler.apply(game);
            });
        } finally {
            if (added) {
                associateClientWithGameRef(client, gameRef);
            } else {
                closeGameRef(gameRef);
            }
        }
    }

    private void associateClientWithGameRef(Client client, GameRef gameRef) {
        GameRef previousGameRefForClient;
        synchronized (this) {
            previousGameRefForClient = clientToGameRef.put(client, gameRef);
        }
        if (previousGameRefForClient != null) {
            log.warn("Client {} unexpectedly switched between games. New game: {} - Old game: {}",
                    client.getId(), gameRef.getGameId(), previousGameRefForClient.getGameId());
            closeGameRef(previousGameRefForClient);
        }
    }

    private GameRef getGameRef(String gameId) {
        GameRef gameRef;
        synchronized (this) {
            GameLoader gameLoader = gameLoaders.computeIfAbsent(gameId,
                    id -> new GameLoader(gameId, getGameDir(gameId)));
            log.info("Access to game loader of game {} (total number of game loaders: {})", gameId, gameLoaders.size());
            gameRef = gameLoader.getGameRef();
        }
        return gameRef;
    }

    private void closeGameRef(GameRef gameRef) {
        gameRef.close();
        removeGameLoaderIfUnused(gameRef.getGameId());
    }

    private void removeGameLoaderIfUnused(String gameId) {
        synchronized (this) {
            GameLoader gameLoader = gameLoaders.get(gameId);
            if (gameLoader != null) {
                if (gameLoader.isUnused()) {
                    gameLoaders.remove(gameId);
                    log.info("Removed unused game loader for game {} (total number of loaders: {})", gameLoader.gameId,
                            gameLoaders.size());
                }
            }
        }
    }

    private void handleGameUnknown(Client client) {
        client.send(new UnknownGameState());
    }

    // synchronized is important here to avoid a potential double generation of the same id
    private synchronized String generateAndReserveNewGameId() throws IOException {
        String gameId;
        Path gameDir;
        boolean retry = false;
        do {
            gameId = RandomStringUtils.random(GAME_ID_LENGTH, CHARACTERS_WITHOUT_AMBIGUOUS);
            gameDir = getGameDir(gameId);
            retry = Files.exists(gameDir);
            if (retry) {
                log.info("Retrying generation of new gameId, because generated id '{}' already exists.", gameId);
            }
        } while (retry);
        Files.createDirectories(gameDir);
        return gameId;
    }

    public Path getGameDir(String gameId) {
        validateGameId(gameId);
        // split gameId into two parts. this makes sure we do not create too many
        // folders on one level
        return gamesPath.resolve(gameId.substring(0, 2)).resolve(gameId.substring(2, GAME_ID_LENGTH));
    }

    public static void validateGameId(String gameId) {
        if (gameId.length() != GAME_ID_LENGTH)
            throw new IllegalArgumentException("Wrong gameId length");
        if (!gameIdPattern.matcher(gameId).matches()) {
            throw new IllegalArgumentException("Invalid gameId: " + gameId);
        }
    }

    public void clientDisconnected(Client client) {
        GameRef gameRef;
        synchronized (this) {
            gameRef = clientToGameRef.remove(client);
        }
        if (gameRef == null) {
            return;
        }
        try {
            gameRef.useGame(game -> {
                if (game != null) {
                    game.clientDisconnected(client);
                }
            });
        } finally {
            closeGameRef(gameRef);
        }
    }

    private GameRef getGameRefForClient(Client client) {
        return clientToGameRef.get(client);
    }

    public void handleStartAction(Client client) {
        GameRef gameRef = getGameRefForClient(client);
        if (gameRef == null) {
            log.warn("Cannot handle start. Client {} unknown", client.getId());
            return;
        }
        gameRef.useGame(game -> {
            game.start(client);
        });
    }

    public void handleTypeAction(Client client, TypeAction typeAction) {
        GameRef gameRef = getGameRefForClient(client);
        if (gameRef == null) {
            log.warn("Cannot handle type. Client {} unknown", client.getId());
            return;
        }
        gameRef.useGame(game -> {
            game.type(client, typeAction);
        });
    }

    public void handleReceiveDrawing(Client client, ByteBuffer image) {
        GameRef gameRef = getGameRefForClient(client);
        if (gameRef == null) {
            log.warn("Cannot handle receive drawing. Client {} unknown", client.getId());
            return;
        }
        gameRef.useGame(game -> {
            try {
                game.draw(client, image);
            } catch (IOException e) {
                log.error("Error handling draw action for client {}", client.getId(), e);
            }
        });
    }
}

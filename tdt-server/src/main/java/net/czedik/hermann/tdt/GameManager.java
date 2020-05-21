package net.czedik.hermann.tdt;

import net.czedik.hermann.tdt.actions.AccessAction;
import net.czedik.hermann.tdt.actions.JoinAction;
import net.czedik.hermann.tdt.actions.TypeAction;
import net.czedik.hermann.tdt.playerstate.UnknownGameState;
import org.apache.commons.lang3.RandomStringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@Service
public class GameManager {
    private static final Logger log = LoggerFactory.getLogger(GameManager.class);

    private static final String CHARACTERS_WITHOUT_AMBIGUOUS = "23456789abcdefghijkmnpqrstuvwxyz";
    private static final int GAME_ID_LENGTH = 5;

    // guarded by this
    private final Map<String, Game> loadedGames = new HashMap<>();

    // guarded by this
    private final Map<Client, Game> clientToGame = new HashMap<>();

    private final Path gamesPath;

    // TODO make sure to unload games again, to not run out of memory

    @Autowired
    public GameManager(@Value("${storage.dir}") String storageDir) {
        Path storageDirPath = Path.of(storageDir).toAbsolutePath().normalize();
        log.info("Using storage path: {}", storageDirPath);
        gamesPath = storageDirPath.resolve("games");
    }

    public Game newGame(CreateGameRequest createGameRequest) throws IOException {
        String gameId = generateAndReserveNewGameId();
        Path gameDir = getGameDir(gameId);
        Game game = new Game(gameId, gameDir, new Player(createGameRequest.playerId, createGameRequest.playerName, createGameRequest.playerFace, true));
        synchronized (this) {
            loadedGames.put(game.gameId, game);
        }
        return game;
    }

    public void handleAccessAction(Client client, AccessAction accessAction) {
        Game game = getGame(accessAction.gameId);
        if (game == null) {
            handleGameUnknown(client);
            return;
        }
        boolean added = game.access(client, accessAction);
        if (added) {
            addClientForGame(client, game);
        }
    }

    public void handleJoinAction(Client client, JoinAction joinAction) {
        Game game = getGame(joinAction.gameId);
        if (game == null) {
            handleGameUnknown(client);
            return;
        }
        boolean added = game.join(client, joinAction);
        if (added) {
            addClientForGame(client, game);
        }
    }

    private Game getGame(String gameId) {
        Game game;
        synchronized (this) {
            game = loadedGames.get(gameId);
        }
        if (game == null) {
            log.info("Access to unknown game {}", gameId);
            return null;
        }
        return game;
    }

    private void addClientForGame(Client client, Game game) {
        synchronized (this) {
            clientToGame.put(client, game);
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
        if (gameId.length() != GAME_ID_LENGTH)
            throw new IllegalArgumentException("Wrong gameId length");
        // split gameId into two parts. this makes sure we do not create too many folders on one level
        return gamesPath.resolve(gameId.substring(0, 2)).resolve(gameId.substring(2, GAME_ID_LENGTH));
    }

    public void clientDisconnected(Client client) {
        Game game;
        synchronized (this) {
            game = clientToGame.remove(client);
        }
        if (game != null) {
            game.clientDisconnected(client);
        }
    }

    public void handleStartAction(Client client) {
        Game game = getGame(client);
        if (game == null) {
            log.warn("Cannot handle start. Client {} unknown", client.getId());
            return;
        }
        game.start(client);
    }

    private Game getGame(Client client) {
        synchronized (this) {
            return clientToGame.get(client);
        }
    }

    public void handleTypeAction(Client client, TypeAction typeAction) {
        Game game = getGame(client);
        if (game == null) {
            log.warn("Cannot handle type. Client {} unknown", client.getId());
            return;
        }
        game.type(client, typeAction);
    }

    public void handleReceiveDrawing(Client client, ByteBuffer image) throws IOException {
        Game game = getGame(client);
        if (game == null) {
            log.warn("Cannot handle receive drawing. Client {} unknown", client.getId());
            return;
        }
        game.draw(client, image);
    }
}

package net.czedik.hermann.tdt;

import net.czedik.hermann.tdt.model.AccessAction;
import net.czedik.hermann.tdt.model.CreateGameRequest;
import net.czedik.hermann.tdt.model.JoinAction;
import org.apache.commons.lang3.RandomStringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class GameManager {
    private static final Logger log = LoggerFactory.getLogger(GameManager.class);

    private static final String CHARACTERS_WITHOUT_AMBIGUOUS = "23456789abcdefghijkmnpqrstuvwxyz";

    private final Lock idGenerationLock = new ReentrantLock();

    // guarded by itself
    private final Map<String, Game> loadedGames = new HashMap<>();

    @Value("${storage.dir}")
    private String storageDir;

    // TODO check sync
    private Path gamesPath;

    // TODO make sure to unload games again, to not run out of memory

    @PostConstruct
    private void init() {
        Path storageDirPath = Path.of(storageDir).toAbsolutePath().normalize();
        log.info("Using storage path: {}", storageDirPath);
        gamesPath = storageDirPath.resolve("games");
    }

    public Game newGame(CreateGameRequest createGameRequest) {
        Game game = new Game(generateAndReserveNewGameId(), new Player(createGameRequest.playerId, createGameRequest.playerName, createGameRequest.playerAvatar, true));
        synchronized (loadedGames) {
            loadedGames.put(game.gameId, game);
        }
        return game;
    }

    public void handleAccessAction(Client client, AccessAction accessAction) {
        getGame(accessAction.gameId).access(client, accessAction);
    }

    public void handleJoinAction(Client client, JoinAction joinAction) {
        getGame(joinAction.gameId).join(client, joinAction);
    }

    private Game getGame(String gameId) {
        Game game;
        synchronized (loadedGames) {
            game = loadedGames.get(gameId);
        }
        if (game == null) {
            log.info("Access to unknown game {}", gameId);
            // TODO handle unknown game. might be different for different actions
            return null;
            // TODO handle null case in callers
        }
        return game;
    }

    private String generateAndReserveNewGameId() {
        idGenerationLock.lock();
        try {
            String gameId;
            Path gameDir;
            boolean retry = false;
            do {
                gameId = RandomStringUtils.random(5, CHARACTERS_WITHOUT_AMBIGUOUS);
                gameDir = getGameDir(gameId);
                retry = Files.exists(gameDir);
                if (retry) {
                    log.info("Retrying generation of new gameId, because generated id '{}' already exists.", gameId);
                }
            } while (retry);
            try {
                Files.createDirectories(gameDir);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            return gameId;
        } finally {
            idGenerationLock.unlock();
        }
    }

    private Path getGameDir(String gameId) {
        // split gameId into two parts. this makes sure we do not create too many folders on one level
        return gamesPath.resolve(gameId.substring(0, 2)).resolve(gameId.substring(2, 5));
    }
}

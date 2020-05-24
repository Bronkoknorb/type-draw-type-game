package net.czedik.hermann.tdt;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;
import java.util.function.Function;

public class GameLoader {
    private static final Logger log = LoggerFactory.getLogger(GameLoader.class);

    public final String gameId;

    private final Path gameDir;

    private Game loadedGame;

    private final AtomicLong gameRefCount = new AtomicLong(0);

    public GameLoader(String gameId, Path gameDir) {
        this.gameId = Objects.requireNonNull(gameId);
        this.gameDir = Objects.requireNonNull(gameDir);
    }

    public GameRef getGameRef() {
        return new GameRef();
    }

    // note: this method is only safe, if the caller synchronizes with the same lock on both getGameRef() and isUnused() calls
    public boolean isUnused() {
        return gameRefCount.get() == 0;
    }

    private Game loadGame() {
        log.info("Loading game {}", gameId);

        Path gameStateFile = gameDir.resolve(Game.STATE_FILENAME);

        GameState gameState;
        try (InputStream in = new BufferedInputStream(Files.newInputStream(gameStateFile))) {
            gameState = JSONHelper.objectMapper.readValue(in, GameState.class);
        } catch (NoSuchFileException e) {
            log.info("Cannot load unknown game {} (no state file)", gameId);
            return null;
        } catch (IOException e) {
            log.error("Error loading game {}", gameId, e);
            return null;
        }
        return new Game(gameId, gameDir, gameState);
    }

    public class GameRef {
        private boolean closed = false;

        public GameRef() {
            gameRefCount.getAndIncrement();
        }

        public String getGameId() {
            return gameId;
        }

        public void setNewGame(Game newGame) {
            synchronized (GameLoader.this) {
                checkNotClosed();
                if (loadedGame != null) {
                    throw new IllegalStateException("Cannot set a new game if a game is already loaded");
                }
                loadedGame = Objects.requireNonNull(newGame);
            }
        }

        public void useGame(Consumer<Game> handler) {
            useGame(game -> {
                handler.accept(game);
                return null;
            });
        }

        public <R> R useGame(Function<Game, R> handler) {
            synchronized (GameLoader.this) {
                checkNotClosed();

                if (loadedGame == null) {
                    loadedGame = loadGame();
                }

                return handler.apply(loadedGame);
            }
        }

        private void checkNotClosed() {
            if (closed) {
                throw new IllegalStateException("Reference to game already closed");
            }
            if (gameRefCount.get() <= 0) {
                throw new IllegalStateException("No more references to game");
            }
        }

        public void close() {
            synchronized (GameLoader.this) {
                checkNotClosed();
                closed = true;

                // last ref closed -> unload game
                // note: it can happen that concurrently a new ref gets created, then the game will be loaded again
                if (gameRefCount.get() == 1) {
                    if (loadedGame != null) {
                        loadedGame.storeState();
                        loadedGame = null;
                    }
                }

                // important: only after storing the state we decrement the count,
                // so that afterwards the GameLoader can be safely destroyed (if no new ref was created in the meantime)
                gameRefCount.decrementAndGet();
            }
        }
    }
}

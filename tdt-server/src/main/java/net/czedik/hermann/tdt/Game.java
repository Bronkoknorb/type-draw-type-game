package net.czedik.hermann.tdt;

import net.czedik.hermann.tdt.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.stream.Collectors;

public class Game {
    private static final Logger log = LoggerFactory.getLogger(Game.class);

    // TODO synchronization

    public final String gameId;

    private final Map<String, Player> players = new LinkedHashMap<>();

    private final Map<Client, Player> clientToPlayer = new HashMap<>();

    private final int round = 0;

    private State state = State.WaitingForPlayers;

    private int[][] gameMatrix = null;

    public Game(String gameId, Player creator) {
        this.gameId = Objects.requireNonNull(gameId);
        players.put(creator.id, creator);
    }

    // returns whether the client has been added as a player to the game
    public synchronized boolean access(Client client, AccessAction accessAction) {
        Player player = players.get(accessAction.playerId);
        if (player == null) {
            if (state == State.WaitingForPlayers) {
                log.info("Game {}: New player {} accessing via client {}", gameId, accessAction.playerId, client.getId());
                client.send(new JoinState());
            } else {
                // TODO
            }
            return false;
        } else {
            log.info("Game {}: New client {} connected for known player {}", gameId, client.getId(), player.id);
            addClientForPlayer(client, player);
            updateStateForPlayer(player);
            return true;
        }
    }

    private void addClientForPlayer(Client client, Player player) {
        clientToPlayer.put(client, player);
        player.addClient(client);
    }

    // returns whether the client has been added as a player to the game
    public synchronized boolean join(Client client, JoinAction joinAction) {
        if (state == State.WaitingForPlayers) {
            log.info("Game {}: Player {} joining with name '{}' via client {}", gameId, joinAction.playerId, joinAction.name, client.getId());
            Player player = players.get(joinAction.playerId);
            if (player != null) {
                log.warn("Game {}: Player {} has already joined", gameId, joinAction.playerId);
            } else {
                player = new Player(joinAction.playerId, joinAction.name, joinAction.avatar, false);
                players.put(joinAction.playerId, player);
            }
            addClientForPlayer(client, player);
            updateStateForAllPlayers();
            return true;
        } else {
            log.info("Game {}: Join not possible in state {}", gameId, state);
            // TODO handle this case
            return false;
        }
    }

    private void updateStateForAllPlayers() {
        for (Player player : players.values()) {
            updateStateForPlayer(player);
        }
    }

    private void updateStateForPlayer(Player player) {
        PlayerState playerState = getPlayerState(player);
        for (Client client : player.clients) {
            client.send(playerState);
        }
    }

    private PlayerState getPlayerState(Player player) {
        if (state == State.WaitingForPlayers) {
            List<PlayerInfo> playerInfos = players.values().stream().map(p -> new PlayerInfo(p.name, p.avatar)).collect(Collectors.toList());
            if (player.isCreator) {
                return new WaitForPlayersState(playerInfos);
            } else {
                return new WaitForGameStartState(playerInfos);
            }
        } else if (state == State.Started) {
            if (round == 0) {
                return new TypeFirstState(players.size());
            } else {
                // TODO
                return null;
            }
        } else {
            // TODO
            throw new IllegalStateException();
        }
    }

    public synchronized void clientDisconnected(Client client) {
        Player player = clientToPlayer.remove(client);
        if (player != null) {
            player.removeClient(client);
            if (state == State.WaitingForPlayers) {
                if (!player.isCreator && player.clients.isEmpty()) {
                    log.info("Game {}: Player {} has left the game", gameId, player.id);
                    players.remove(player.id);
                    updateStateForAllPlayers();
                }

                // TODO if the creator leaves (clients.isEmpty()) we should probably drop the game (and inform all other players)
            } else {
                // TODO
            }
        }
    }

    public synchronized void start(Client client) {
        Player player = clientToPlayer.get(client);
        if (player == null) {
            log.warn("Game {}: Client {} is not a known player", gameId, client.getId());
            return;
        }
        if (state == State.WaitingForPlayers) {
            if (player.isCreator) {
                if (players.size() > 1) {
                    startGame();
                } else {
                    log.warn("Game {}: Cannot start game with less than 2 players", gameId);
                    updateStateForAllPlayers();
                }
            } else {
                log.warn("Game {}: Non-creator {} cannot start the game (client: {})", gameId, player.id, client.getId());
            }
        } else {
            log.warn("Game {}: Ignoring start in state {}", gameId, state);
        }
    }

    private void startGame() {
        log.info("Game {}: Starting", gameId);
        state = State.Started;
        gameMatrix = GameRoundsGenerator.generate(players.size());
        updateStateForAllPlayers();
    }

    public enum State {
        WaitingForPlayers,
        Started
    }
}

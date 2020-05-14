package net.czedik.hermann.tdt;

import net.czedik.hermann.tdt.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

public class Game {
    private static final Logger log = LoggerFactory.getLogger(Game.class);

    // TODO synchronization

    public final String gameId;
    public final Map<String, Player> players = new LinkedHashMap<>();

    private State state = State.WaitingForPlayers;

    public Game(String gameId, Player creator) {
        this.gameId = Objects.requireNonNull(gameId);
        players.put(creator.id, creator);
    }

    public void access(Client client, AccessAction accessAction) {
        Player player = players.get(accessAction.playerId);
        if (player == null) {
            if (state == State.WaitingForPlayers) {
                log.info("Game {}: New player {} accessing via client {}", gameId, accessAction.playerId, client.getId());
                client.send(new JoinState());
            } else {
                // TODO
            }
        } else {
            log.info("Game {}: New client {} connected for known player {}", gameId, client.getId(), player.id);
            player.addClient(client);
            updateStateForPlayer(player);
        }
    }

    public void join(Client client, JoinAction joinAction) {
        if (state == State.WaitingForPlayers) {
            log.info("Game {}: Player {} joining with name '{}' via client {}", gameId, joinAction.playerId, joinAction.name, client.getId());
            Player player = players.get(joinAction.playerId);
            if (player != null) {
                log.warn("Game {}: Player {} has already joined", gameId, joinAction.playerId);
            } else {
                player = new Player(joinAction.playerId, joinAction.name, joinAction.avatar, false);
                players.put(joinAction.playerId, player);
            }
            player.addClient(client);
            updateStateForAllPlayers();
        } else {
            log.info("Game {}: Join not possible in state {}", gameId, state);
            // TODO handle this case
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
                return new WaitForPlayers(playerInfos);
            } else {
                return new WaitForGameStart(playerInfos);
            }
        } else {
            // TODO
            throw new IllegalStateException();
        }
    }

    public enum State {
        WaitingForPlayers
    }
}

package net.czedik.hermann.tdt;

import net.czedik.hermann.tdt.model.AccessAction;
import net.czedik.hermann.tdt.model.JoinState;
import net.czedik.hermann.tdt.model.WaitForGameStart;
import net.czedik.hermann.tdt.model.WaitForPlayers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

public class Game {
    private static final Logger log = LoggerFactory.getLogger(Game.class);
    // TODO synchronization

    public final String gameId;
    public final Map<String, Player> players = new LinkedHashMap<>();

    private State state = State.WaitingForPlayers;

    public Game(String gameId, Player creator) {
        this.gameId = Objects.requireNonNull(gameId);
        players.put(creator.userId, creator);
    }

    public void access(Client client, AccessAction accessAction) {
        Player player = players.get(accessAction.userId);
        if(player==null) {
            if (state == State.WaitingForPlayers) {
                log.info("Game {}: New player {} accessing", gameId, accessAction.userId);
                client.send(new JoinState());
            } else {
                // TODO
            }
        } else {
            // TODO log client id
            log.info("Game {}: New client connected for known player {}", gameId, accessAction.userId);
            player.addClient(client);
            if(state == State.WaitingForPlayers) {
                if(player.isCreator) {
                    client.send(new WaitForPlayers());
                } else {
                    client.send(new WaitForGameStart());
                }
            } else {
                // TODO
            }
        }
    }

    public enum State {
        WaitingForPlayers
    }
}

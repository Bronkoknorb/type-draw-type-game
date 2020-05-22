package net.czedik.hermann.tdt;

import net.czedik.hermann.tdt.playerstate.PlayerState;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.PingMessage;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;

public class Client {
    private static final Logger log = LoggerFactory.getLogger(Client.class);

    private final WebSocketSession session;

    public Client(WebSocketSession session) {
        this.session = session;
    }

    public String getId() {
        return session.getId();
    }

    public void send(PlayerState state) {
        String stateJson = JSONHelper.objectToJsonString(state);
        log.info("Sending player state to client {}: {}", getId(), stateJson);
        try {
            // synchronized, because WebSocketSession.sendMessage(.) does not allow concurrent sending
            synchronized (this) {
                session.sendMessage(new TextMessage(stateJson));
            }
        } catch (IOException | RuntimeException e) {
            log.error("Exception when updating client {}", getId(), e);
        }
    }

    public void ping() {
        try {
            // synchronized, because WebSocketSession.sendMessage(.) does not allow concurrent sending
            synchronized (this) {
                session.sendMessage(new PingMessage());
            }
        } catch (IOException | RuntimeException e) {
            log.warn("Exception when pinging client {}", getId(), e);
        }
    }
}

package net.czedik.hermann.tdt;

import net.czedik.hermann.tdt.model.JSONHelper;
import net.czedik.hermann.tdt.model.PlayerState;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;

public class Client {
    private static final Logger log = LoggerFactory.getLogger(Client.class);

    private final WebSocketSession session;

    public Client(WebSocketSession session) {
        this.session = session;
    }

    public void send(PlayerState state) {
        String stateJson = JSONHelper.objectToJsonString(state);
        log.info("Sending player state: {}", stateJson); // TODO document to which player/client we send
        try {
            // synchronized, because WebSocketSession.sendMessage(.) does not allow concurrent sending
            synchronized (this) {
                session.sendMessage(new TextMessage(stateJson));
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}

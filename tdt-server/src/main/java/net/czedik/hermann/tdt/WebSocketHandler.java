package net.czedik.hermann.tdt;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

import java.io.FileOutputStream;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.channels.FileChannel;

public class WebSocketHandler extends AbstractWebSocketHandler {

    // TODO make sure that all calls to sendMessage() are single threaded

    private static final Logger log = LoggerFactory.getLogger(WebSocketHandler.class);

    private static final ObjectMapper jsonMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("Connection {} from: {}", session.getId(), getHostname(session));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        log.info("Closed connection {} ({})", session.getId(), getHostname(session));
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
        String payload = message.getPayload();
        log.info("Received message: {}", payload);
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) throws IOException {
        // TODO test what happens if we get IOException here
        log.info("Received image of size: {}kB", message.getPayloadLength() / 1024);
        // TODO make path configurable, write for the right game
        try (FileChannel fc = new FileOutputStream("/home/hermann/test.png").getChannel()) {
            fc.write(message.getPayload());
        }
    }

    private String getHostname(WebSocketSession session) {
        InetSocketAddress remoteAddress = session.getRemoteAddress();
        return remoteAddress != null ? remoteAddress.getHostName() : null;
    }
}

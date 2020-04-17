package net.czedik.hermann.tdt;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

import java.io.IOException;
import java.net.InetSocketAddress;

public class WebSocketHandler extends AbstractWebSocketHandler {

    // TODO make sure that all calls to sendMessage() are single threaded

    private static final Logger log = LoggerFactory.getLogger(WebSocketHandler.class);

    private static final ObjectMapper jsonMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        InetSocketAddress remoteAddress = session.getRemoteAddress();
        log.info("Connection {} from: {}", session.getId(), remoteAddress != null ? remoteAddress.getHostName() : null);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        InetSocketAddress remoteAddress = session.getRemoteAddress();
        log.info("Closed connection {} ({})", session.getId(), remoteAddress != null ? remoteAddress.getHostName() : null);
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
        // TODO
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
        // TODO
    }
}
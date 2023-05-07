package net.czedik.hermann.tdt;

import java.net.InetSocketAddress;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;

import net.czedik.hermann.tdt.actions.AccessAction;
import net.czedik.hermann.tdt.actions.JoinAction;
import net.czedik.hermann.tdt.actions.TypeAction;

public class WebSocketHandler extends AbstractWebSocketHandler {
    private static final Logger log = LoggerFactory.getLogger(WebSocketHandler.class);

    private static final long KEEP_CLIENTS_ALIVE_INTERVAL_SECONDS = 15;

    private final Map<WebSocketSession, Client> clients = new ConcurrentHashMap<>();

    private final GameManager gameManager;

    private final ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();

    @Autowired
    public WebSocketHandler(GameManager gameManager) {
        this.gameManager = gameManager;

        executorService.scheduleWithFixedDelay(this::keepClientsActive,
                KEEP_CLIENTS_ALIVE_INTERVAL_SECONDS, KEEP_CLIENTS_ALIVE_INTERVAL_SECONDS, TimeUnit.SECONDS);
    }

    /**
     * This is necessary, because when proxying via nginx, nginx will automatically close the Websocket connection if
     * there is no activity for 30 seconds.
     */
    private void keepClientsActive() {
        for (Client client : clients.values()) {
            client.ping();
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        clients.put(session, new Client(session));
        log.info("Connection {} from: {} (total clients: {})", session.getId(), getHostname(session), clients.size());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Client client = clients.remove(session);
        log.info("Closed connection {} ({}) with status {} (total clients: {})", session.getId(), getHostname(session), status, clients.size());
        gameManager.clientDisconnected(client);
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws JsonProcessingException {
        Client client = Objects.requireNonNull(clients.get(session));
        String payload = message.getPayload();
        log.info("Client {} sent message: {}", client.getId(), payload);
        JsonNode actionMessage = JSONHelper.stringToJsonNode(payload);
        String action = actionMessage.get("action").asText();
        JsonNode content = actionMessage.get("content");
        if ("access".equals(action)) {
            AccessAction accessAction = JSONHelper.objectMapper.treeToValue(content, AccessAction.class);
            gameManager.handleAccessAction(client, accessAction);
        } else if ("join".equals(action)) {
            JoinAction joinAction = JSONHelper.objectMapper.treeToValue(content, JoinAction.class);
            gameManager.handleJoinAction(client, joinAction);
        } else if ("start".equals(action)) {
            gameManager.handleStartAction(client);
        } else if ("type".equals(action)) {
            TypeAction typeAction = JSONHelper.objectMapper.treeToValue(content, TypeAction.class);
            gameManager.handleTypeAction(client, typeAction);
        } else {
            throw new IllegalArgumentException("Unknown action: " + action);
        }
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
        Client client = Objects.requireNonNull(clients.get(session));
        log.info("Received image (size: {}KB) from client {}", message.getPayloadLength() / 1000, client.getId());

        gameManager.handleReceiveDrawing(client, message.getPayload());
    }

    private static String getHostname(WebSocketSession session) {
        InetSocketAddress remoteAddress = session.getRemoteAddress();
        return remoteAddress != null ? remoteAddress.getHostName() : null;
    }
}

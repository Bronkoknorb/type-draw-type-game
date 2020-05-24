package net.czedik.hermann.tdt;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private static final int ONE_MB = 1 * 1024 * 1024;
    private static final int FIVE_MB = 5 * 1024 * 1024;

    @Autowired
    private GameManager gameManager;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(myHandler(), "/api/websocket");
    }

    @Bean
    public WebSocketHandler myHandler() {
        return new WebSocketHandler(gameManager);
    }

    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxTextMessageBufferSize(ONE_MB);
        container.setMaxBinaryMessageBufferSize(FIVE_MB);
        return container;
    }

}

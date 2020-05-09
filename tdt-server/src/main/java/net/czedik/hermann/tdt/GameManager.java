package net.czedik.hermann.tdt;

import net.czedik.hermann.tdt.model.CreateGameRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.ApplicationScope;

@Service
public class GameManager {
    public Game newGame(CreateGameRequest createGameRequest) {
        return new Game("xyz"); // TODO
    }
}

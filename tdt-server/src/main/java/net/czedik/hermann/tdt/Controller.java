package net.czedik.hermann.tdt;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@RestController
@RequestMapping("/api")
public class Controller {

    private static final Logger log = LoggerFactory.getLogger(Controller.class);

    private final GameManager gameManager;

    @Autowired
    public Controller(GameManager gameManager) {
        this.gameManager = gameManager;
    }

    @PostMapping(path = "/create",
            consumes = {MediaType.APPLICATION_JSON_VALUE},
            produces = {MediaType.APPLICATION_JSON_VALUE})
    public CreateGameResponse createGame(@Valid @RequestBody CreateGameRequest createGameRequest) {
        log.info("Create game: {}", createGameRequest);
        Game game = gameManager.newGame(createGameRequest);
        CreateGameResponse response = new CreateGameResponse(game.gameId);
        log.info("Created game: {}", response);
        return response;
    }

    @GetMapping(path = "/image")
    public void getImage(HttpServletResponse response) throws IOException {
        response.setContentType(MediaType.IMAGE_PNG_VALUE);
        // TODO path
        try (InputStream in = new FileInputStream("/home/hermann/test.png")) {
            StreamUtils.copy(in, response.getOutputStream());
        }
    }

}

package net.czedik.hermann.tdt;

import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.ByteBuffer;
import java.nio.channels.ByteChannel;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.ArrayUtils;
import org.apache.logging.log4j.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import net.czedik.hermann.tdt.actions.AccessAction;
import net.czedik.hermann.tdt.actions.JoinAction;
import net.czedik.hermann.tdt.actions.TypeAction;
import net.czedik.hermann.tdt.playerstate.AlreadyStartedGameState;
import net.czedik.hermann.tdt.playerstate.DrawState;
import net.czedik.hermann.tdt.playerstate.FrontendStory;
import net.czedik.hermann.tdt.playerstate.FrontendStoryElement;
import net.czedik.hermann.tdt.playerstate.JoinState;
import net.czedik.hermann.tdt.playerstate.PlayerState;
import net.czedik.hermann.tdt.playerstate.StoriesState;
import net.czedik.hermann.tdt.playerstate.TypeState;
import net.czedik.hermann.tdt.playerstate.WaitForGameStartState;
import net.czedik.hermann.tdt.playerstate.WaitForPlayersState;
import net.czedik.hermann.tdt.playerstate.WaitForRoundFinishState;

// note: this class is not thread-safe, and relies on external synchronization (by the owning GameLoader)
public class Game {
    private static final Logger log = LoggerFactory.getLogger(Game.class);

    public static final String STATE_FILENAME = "state.json";

    public final String gameId;

    private final Path gameDir;

    private final GameState gameState;

    private final Map<Client, Player> clientToPlayer = new HashMap<>();

    private final Map<Player, Set<Client>> playerToClients = new HashMap<>();

    public Game(String gameId, Path gameDir, Player creator) {
        this(gameId, gameDir, new GameState());

        gameState.players.add(Objects.requireNonNull(creator));
    }

    public Game(String gameId, Path gameDir, GameState gameState) {
        this.gameId = Objects.requireNonNull(gameId);
        this.gameDir = Objects.requireNonNull(gameDir);
        this.gameState = Objects.requireNonNull(gameState);
    }

    // returns whether the client has been added as a player to the game
    public boolean access(Client client, AccessAction accessAction) {
        Player player = getPlayerById(accessAction.playerId());
        if (player == null) {
            log.info("Game {}: New player {} accessing via client {}", gameId, accessAction.playerId(), client.getId());
            client.send(getStateForAccessByNewPlayer());
            return false;
        } else {
            log.info("Game {}: New client {} connected for known player {}", gameId, client.getId(), player.id());
            addClientForPlayer(client, player);
            updateStateForPlayer(player);
            return true;
        }
    }

    private Player getPlayerById(String playerId) {
        return gameState.players.stream().filter(p -> p.id().equals(playerId)).findAny().orElse(null);
    }

    private PlayerState getStateForAccessByNewPlayer() {
        switch (gameState.state) {
            case WaitingForPlayers:
                return new JoinState();
            case Started:
                return new AlreadyStartedGameState();
            case Finished:
                return getFinishedState();
            default:
                throw new IllegalStateException("Unknown state " + gameState.state);
        }
    }

    private void addClientForPlayer(Client client, Player player) {
        clientToPlayer.put(client, player);
        playerToClients.computeIfAbsent(player, p -> new HashSet<>()).add(client);
    }

    // returns whether the client has been added as a player to the game
    public boolean join(Client client, JoinAction joinAction) {
        if (gameState.state == GameState.State.WaitingForPlayers) {
            log.info("Game {}: Player {} joining with name '{}' via client {}", gameId, joinAction.playerId(),
                    joinAction.name(), client.getId());
            Player player = getPlayerById(joinAction.playerId());
            if (player != null) {
                log.warn("Game {}: Player {} has already joined", gameId, joinAction.playerId());
            } else {
                player = new Player(joinAction.playerId(), joinAction.name(), joinAction.face(), false);
                gameState.players.add(player);
            }
            addClientForPlayer(client, player);
            updateStateForAllPlayers();
            return true;
        } else {
            log.info("Game {}: Join not possible in state {}", gameId, gameState.state);
            client.send(getStateForAccessByNewPlayer());
            return false;
        }
    }

    private void updateStateForAllPlayers() {
        for (Player player : gameState.players) {
            updateStateForPlayer(player);
        }
    }

    private void updateStateForPlayer(Player player) {
        PlayerState playerState = getPlayerState(player);
        for (Client client : playerToClients.getOrDefault(player, Collections.emptySet())) {
            client.send(playerState);
        }
    }

    private PlayerState getPlayerState(Player player) {
        switch (gameState.state) {
            case WaitingForPlayers:
                return getWaitingForPlayersState(player);
            case Started:
                return getStartedState(player);
            case Finished:
                return getFinishedState();
            default:
                throw new IllegalStateException("Unknown state: " + gameState.state);
        }
    }

    private PlayerState getFinishedState() {
        return new StoriesState(mapStoriesToFrontendStories());
    }

    private FrontendStory[] mapStoriesToFrontendStories() {
        FrontendStory[] frontendStories = new FrontendStory[gameState.stories.length];
        for (int storyIndex = 0; storyIndex < gameState.stories.length; storyIndex++) {
            StoryElement[] elements = gameState.stories[storyIndex].elements;
            FrontendStory frontendStory = mapStoryElementsToFrontendStoryElements(storyIndex, elements);
            frontendStories[storyIndex] = frontendStory;
        }
        return frontendStories;
    }

    private FrontendStory mapStoryElementsToFrontendStoryElements(int storyIndex, StoryElement[] elements) {
        FrontendStory frontendStory = new FrontendStory(new FrontendStoryElement[elements.length]);
        for (int roundNo = 0; roundNo < elements.length; roundNo++) {
            StoryElement e = elements[roundNo];
            Player player = getPlayerForStoryInRound(storyIndex, roundNo);
            String content = "image".equals(e.type) ? getDrawingSrc(e.content) : e.content;
            frontendStory.elements()[roundNo] = new FrontendStoryElement(e.type, content,
                    mapPlayerToPlayerInfo(player));
        }
        return frontendStory;
    }

    private PlayerState getStartedState(Player player) {
        if (gameState.state != GameState.State.Started)
            throw new IllegalStateException("Only valid to call this method in started state");

        if (!hasPlayerFinishedCurrentRound(player)) {
            if (isTypeRound()) {
                return getTypeState(player);
            } else { // draw round
                return getDrawState(player);
            }
        } else {
            return getWaitForRoundFinishedState();
        }
    }

    private PlayerState getWaitForRoundFinishedState() {
        List<Player> playersNotFinished = getNotFinishedPlayers();
        return new WaitForRoundFinishState(mapPlayersToPlayerInfos(playersNotFinished), isTypeRound());
    }

    private PlayerState getDrawState(Player player) {
        int storyIndex = getCurrentStoryIndexForPlayer(player);
        String text = getStoryByIndex(storyIndex).elements[gameState.round - 1].content;
        Player previousPlayer = getPreviousPlayerForStory(storyIndex);
        return new DrawState(gameState.round + 1, gameState.gameMatrix.length, text, mapPlayerToPlayerInfo(previousPlayer));
    }

    private PlayerState getTypeState(Player player) {
        int roundOneBased = gameState.round + 1;
        int rounds = gameState.gameMatrix.length;
        if (gameState.round == 0) {
            return new TypeState(roundOneBased, rounds);
        } else {
            int storyIndex = getCurrentStoryIndexForPlayer(player);
            String imageFilename = getStoryByIndex(storyIndex).elements[gameState.round - 1].content;
            Player previousPlayer = getPreviousPlayerForStory(storyIndex);
            return new TypeState(roundOneBased, rounds, getDrawingSrc(imageFilename), mapPlayerToPlayerInfo(previousPlayer));
        }
    }

    private PlayerState getWaitingForPlayersState(Player player) {
        if (gameState.state != GameState.State.WaitingForPlayers)
            throw new IllegalStateException("Only valid to call this method in started state");

        List<PlayerInfo> playerInfos = mapPlayersToPlayerInfos(gameState.players);
        if (player.isCreator()) {
            return new WaitForPlayersState(playerInfos);
        } else {
            return new WaitForGameStartState(playerInfos);
        }
    }

    private String getDrawingSrc(String imageFilename) {
        return "/api/image/" + gameId + "/" + imageFilename;
    }

    private Player getPreviousPlayerForStory(int storyIndex) {
        return getPlayerForStoryInRound(storyIndex, gameState.round - 1);
    }

    private Player getPlayerForStoryInRound(int storyIndex, int roundNo) {
        int previousPlayerIndexForStory = ArrayUtils.indexOf(gameState.gameMatrix[roundNo], storyIndex);
        return gameState.players.get(previousPlayerIndexForStory);
    }

    private Story getStoryByIndex(int storyIndex) {
        return gameState.stories[storyIndex];
    }

    private List<Player> getNotFinishedPlayers() {
        return gameState.players.stream().filter(p -> !hasPlayerFinishedCurrentRound(p)).collect(Collectors.toList());
    }

    private boolean hasPlayerFinishedCurrentRound(Player player) {
        return getCurrentStoryForPlayer(player).elements[gameState.round] != null;
    }

    private static List<PlayerInfo> mapPlayersToPlayerInfos(Collection<Player> players) {
        return players.stream().map(Game::mapPlayerToPlayerInfo).collect(Collectors.toList());
    }

    private static PlayerInfo mapPlayerToPlayerInfo(Player p) {
        return new PlayerInfo(p.name(), p.face(), p.isCreator());
    }

    public void clientDisconnected(Client client) {
        Player player = clientToPlayer.remove(client);
        if (player == null) {
            log.info("Game {}: Client {} disconnect. Not a player in this game.", gameId, client.getId());
            return;
        }

        log.info("Game {}: Client {} of player {} disconnected", gameId, client.getId(), player.id());

        Set<Client> clientsOfPlayer = playerToClients.get(player);
        clientsOfPlayer.remove(client);

        if (gameState.state == GameState.State.WaitingForPlayers) {
            if (!player.isCreator() && clientsOfPlayer.isEmpty()) {
                log.info("Game {}: Player {} has left the game", gameId, player.id());
                gameState.players.remove(player);
                playerToClients.remove(player);
                updateStateForAllPlayers();
            }
        }
    }

    public void start(Client client) {
        Player player = clientToPlayer.get(client);
        if (player == null) {
            log.warn("Game {}: Cannot start game. Client {} is not a known player", gameId, client.getId());
            return;
        }
        if (gameState.state != GameState.State.WaitingForPlayers) {
            log.warn("Game {}: Ignoring start in state {}", gameId, gameState.state);
            return;
        }
        if (!player.isCreator()) {
            log.warn("Game {}: Non-creator {} cannot start the game (client: {})", gameId, player.id(), client.getId());
            return;
        }

        if (gameState.players.size() > 1) {
            startGame();
        } else {
            log.warn("Game {}: Cannot start game with less than 2 players", gameId);
            updateStateForAllPlayers();
        }
    }

    private void startGame() {
        log.info("Game {}: Starting", gameId);
        gameState.state = GameState.State.Started;

        gameState.gameMatrix = GameRoundsGenerator.generate(gameState.players.size());

        gameState.stories = new Story[gameState.players.size()];
        Arrays.setAll(gameState.stories, i -> new Story(gameState.players.size()));

        storeState();

        updateStateForAllPlayers();
    }

    public void type(Client client, TypeAction typeAction) {
        Player player = clientToPlayer.get(client);
        if (player == null) {
            log.warn("Game {}: Cannot type. Client {} is not a known player", gameId, client.getId());
            return;
        }
        if (gameState.state != GameState.State.Started) {
            log.warn("Game {}: Ignoring type in state {}", gameId, gameState.state);
            return;
        }
        if (!isTypeRound()) {
            log.warn("Game {}: Ignoring type in draw round {}", gameId, gameState.round);
            return;
        }
        String text = typeAction.text();
        if (Strings.isEmpty(text)) {
            throw new IllegalArgumentException("Empty text");
        }
        int maxTextLength = 2000; // same limit as in webapp code
        if (text.length() > maxTextLength) {
            text = text.substring(0, maxTextLength);
        }

        Story story = getCurrentStoryForPlayer(player);
        story.elements[gameState.round] = StoryElement.createTextElement(text);

        checkAndHandleRoundFinished();

        updateStateForAllPlayers();
    }

    private Story getCurrentStoryForPlayer(Player player) {
        return getStoryByIndex(getCurrentStoryIndexForPlayer(player));
    }

    private int getCurrentStoryIndexForPlayer(Player player) {
        return gameState.gameMatrix[gameState.round][gameState.players.indexOf(player)];
    }

    private boolean isCurrentRoundFinished() {
        return Arrays.stream(gameState.stories).allMatch(s -> s.elements[gameState.round] != null);
    }

    private boolean isTypeRound() {
        return isTypeRound(gameState.round);
    }

    private boolean isDrawRound() {
        return !isTypeRound();
    }

    private static boolean isTypeRound(int roundNo) {
        return roundNo % 2 == 0;
    }

    public void draw(Client client, ByteBuffer image) throws IOException {
        Player player = clientToPlayer.get(client);
        if (player == null) {
            log.warn("Game {}: Cannot draw. Client {} is not a known player", gameId, client.getId());
            return;
        }
        if (gameState.state != GameState.State.Started) {
            log.warn("Game {}: Ignoring draw in state {}", gameId, gameState.state);
            return;
        }
        if (!isDrawRound()) {
            log.warn("Game {}: Ignoring draw in type round {}", gameId, gameState.round);
            return;
        }

        Story story = getCurrentStoryForPlayer(player);

        String imageName = UUID.randomUUID().toString() + ".png";
        Path imagePath = gameDir.resolve(imageName);

        try (ByteChannel channel =
                     Files.newByteChannel(imagePath, EnumSet.of(StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE))) {
            channel.write(image);
        }

        story.elements[gameState.round] = StoryElement.createImageElement(imageName);

        checkAndHandleRoundFinished();

        updateStateForAllPlayers();
    }

    private void checkAndHandleRoundFinished() {
        if (isCurrentRoundFinished()) {
            gameState.round++;

            if (isGameFinished()) {
                gameState.state = GameState.State.Finished;
            }

            storeState();
        }
    }

    private boolean isGameFinished() {
        return gameState.round >= gameState.gameMatrix.length;
    }

    public void storeState() {
        log.info("Game {}: Storing state", gameId);
        try (OutputStream out = new BufferedOutputStream(Files.newOutputStream(gameDir.resolve(STATE_FILENAME)))) {
            JSONHelper.objectMapper.writeValue(out, gameState);
        } catch (IOException e) {
            log.error("Game {}: Error storing state", gameId, e);
        }
    }
}

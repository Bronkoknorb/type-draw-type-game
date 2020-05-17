package net.czedik.hermann.tdt;

import net.czedik.hermann.tdt.actions.AccessAction;
import net.czedik.hermann.tdt.actions.JoinAction;
import net.czedik.hermann.tdt.actions.TypeAction;
import net.czedik.hermann.tdt.playerstate.*;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.logging.log4j.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.ByteChannel;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.*;
import java.util.stream.Collectors;

public class Game {
    private static final Logger log = LoggerFactory.getLogger(Game.class);

    // TODO synchronization

    public final String gameId;

    private final Path gameDir;

    private final Map<String, Player> players = new LinkedHashMap<>();

    private final Map<Client, Player> clientToPlayer = new HashMap<>();

    /**
     * Current round number (zero based)
     */
    private int round = 0;

    private State state = State.WaitingForPlayers;

    private int[][] gameMatrix = null;

    private Story[] stories = null;

    public Game(String gameId, Path gameDir, Player creator) {
        this.gameId = Objects.requireNonNull(gameId);
        this.gameDir = gameDir;
        players.put(creator.id, creator);
    }

    // returns whether the client has been added as a player to the game
    public synchronized boolean access(Client client, AccessAction accessAction) {
        Player player = players.get(accessAction.playerId);
        if (player == null) {
            if (state == State.WaitingForPlayers) {
                log.info("Game {}: New player {} accessing via client {}", gameId, accessAction.playerId, client.getId());
                client.send(new JoinState());
            } else {
                // TODO
            }
            return false;
        } else {
            log.info("Game {}: New client {} connected for known player {}", gameId, client.getId(), player.id);
            addClientForPlayer(client, player);
            updateStateForPlayer(player);
            return true;
        }
    }

    private void addClientForPlayer(Client client, Player player) {
        clientToPlayer.put(client, player);
        player.addClient(client);
    }

    // returns whether the client has been added as a player to the game
    public synchronized boolean join(Client client, JoinAction joinAction) {
        if (state == State.WaitingForPlayers) {
            log.info("Game {}: Player {} joining with name '{}' via client {}", gameId, joinAction.playerId, joinAction.name, client.getId());
            Player player = players.get(joinAction.playerId);
            if (player != null) {
                log.warn("Game {}: Player {} has already joined", gameId, joinAction.playerId);
            } else {
                player = new Player(joinAction.playerId, joinAction.name, joinAction.avatar, false);
                players.put(joinAction.playerId, player);
            }
            addClientForPlayer(client, player);
            updateStateForAllPlayers();
            return true;
        } else {
            log.info("Game {}: Join not possible in state {}", gameId, state);
            // TODO handle this case
            return false;
        }
    }

    private void updateStateForAllPlayers() {
        for (Player player : players.values()) {
            updateStateForPlayer(player);
        }
    }

    private void updateStateForPlayer(Player player) {
        PlayerState playerState = getPlayerState(player);
        for (Client client : player.clients) {
            client.send(playerState);
        }
    }

    private PlayerState getPlayerState(Player player) {
        switch (state) {
            case WaitingForPlayers:
                return getWaitingForPlayersState(player);
            case Started:
                return getStartedState(player);
            case Finished:
                return getFinishedState();
            default:
                throw new IllegalStateException("Unknown state: " + state);
        }
    }

    private PlayerState getFinishedState() {
        StoriesState storiesState = new StoriesState();
        storiesState.stories = mapStoriesToFrontendStories();
        return storiesState;
    }

    private FrontendStory[] mapStoriesToFrontendStories() {
        FrontendStory[] frontendStories = new FrontendStory[stories.length];
        for (int storyIndex = 0; storyIndex < stories.length; storyIndex++) {
            StoryElement[] elements = stories[storyIndex].elements;
            FrontendStory frontendStory = mapStoryElementsToFrontendStoryElements(storyIndex, elements);
            frontendStories[storyIndex] = frontendStory;
        }
        return frontendStories;
    }

    private FrontendStory mapStoryElementsToFrontendStoryElements(int storyIndex, StoryElement[] elements) {
        FrontendStory frontendStory = new FrontendStory();
        frontendStory.elements = new FrontendStoryElement[elements.length];
        for (int roundNo = 0; roundNo < elements.length; roundNo++) {
            StoryElement e = elements[roundNo];
            Player player = getPlayerForStoryInRound(storyIndex, roundNo);
            String content = "image".equals(e.type) ? getDrawingSrc(e.content) : e.content;
            frontendStory.elements[roundNo] = new FrontendStoryElement(e.type, content, mapPlayerToPlayerInfo(player));
        }
        return frontendStory;
    }

    private PlayerState getStartedState(Player player) {
        if (state != State.Started)
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
        String text = getStoryByIndex(storyIndex).elements[round - 1].content;
        Player previousPlayer = getPreviousPlayerForStory(storyIndex);
        return new DrawState(round + 1, gameMatrix.length, text, mapPlayerToPlayerInfo(previousPlayer));
    }

    private PlayerState getTypeState(Player player) {
        int roundOneBased = round + 1;
        int rounds = gameMatrix.length;
        if (round == 0) {
            return new TypeState(roundOneBased, rounds);
        } else {
            int storyIndex = getCurrentStoryIndexForPlayer(player);
            String imageFilename = getStoryByIndex(storyIndex).elements[round - 1].content;
            Player previousPlayer = getPreviousPlayerForStory(storyIndex);
            return new TypeState(roundOneBased, rounds, getDrawingSrc(imageFilename), mapPlayerToPlayerInfo(previousPlayer));
        }
    }

    private PlayerState getWaitingForPlayersState(Player player) {
        if (state != State.WaitingForPlayers)
            throw new IllegalStateException("Only valid to call this method in started state");

        List<PlayerInfo> playerInfos = mapPlayersToPlayerInfos(players.values());
        if (player.isCreator) {
            return new WaitForPlayersState(playerInfos);
        } else {
            return new WaitForGameStartState(playerInfos);
        }
    }

    private String getDrawingSrc(String imageFilename) {
        return "/api/image/" + gameId + "/" + imageFilename;
    }

    private Player getPreviousPlayerForStory(int storyIndex) {
        return getPlayerForStoryInRound(storyIndex, round - 1);
    }

    private Player getPlayerForStoryInRound(int storyIndex, int roundNo) {
        int previousPlayerIndexForStory = ArrayUtils.indexOf(gameMatrix[roundNo], storyIndex);
        // TODO find nicer method to access player by player index
        return new ArrayList<>(players.values()).get(previousPlayerIndexForStory);
    }

    private Story getStoryByIndex(int storyIndex) {
        return stories[storyIndex];
    }

    private List<Player> getNotFinishedPlayers() {
        return players.values().stream().filter(p -> !hasPlayerFinishedCurrentRound(p)).collect(Collectors.toList());
    }

    private boolean hasPlayerFinishedCurrentRound(Player player) {
        return getCurrentStoryForPlayer(player).elements[round] != null;
    }

    private static List<PlayerInfo> mapPlayersToPlayerInfos(Collection<Player> players) {
        return players.stream().map(Game::mapPlayerToPlayerInfo).collect(Collectors.toList());
    }

    private static PlayerInfo mapPlayerToPlayerInfo(Player p) {
        return new PlayerInfo(p.name, p.avatar, p.isCreator);
    }

    public synchronized void clientDisconnected(Client client) {
        Player player = clientToPlayer.remove(client);
        if (player == null) {
            return;
        }

        player.removeClient(client);

        if (state == State.WaitingForPlayers) {
            if (!player.isCreator && player.clients.isEmpty()) {
                log.info("Game {}: Player {} has left the game", gameId, player.id);
                players.remove(player.id);
                updateStateForAllPlayers();
            }

            // TODO if the creator leaves (clients.isEmpty()) we should probably drop the game (and inform all other players)
        } else {
            // TODO
        }
    }

    public synchronized void start(Client client) {
        Player player = clientToPlayer.get(client);
        if (player == null) {
            log.warn("Game {}: Client {} is not a known player", gameId, client.getId());
            return;
        }
        if (state != State.WaitingForPlayers) {
            log.warn("Game {}: Ignoring start in state {}", gameId, state);
            return;
        }
        if (!player.isCreator) {
            log.warn("Game {}: Non-creator {} cannot start the game (client: {})", gameId, player.id, client.getId());
            return;
        }

        if (players.size() > 1) {
            startGame();
        } else {
            log.warn("Game {}: Cannot start game with less than 2 players", gameId);
            updateStateForAllPlayers();
        }
    }

    private void startGame() {
        log.info("Game {}: Starting", gameId);
        state = State.Started;

        gameMatrix = GameRoundsGenerator.generate(players.size());

        stories = new Story[players.size()];
        Arrays.setAll(stories, i -> new Story(players.size()));

        updateStateForAllPlayers();
    }

    public synchronized void type(Client client, TypeAction typeAction) {
        Player player = clientToPlayer.get(client);
        if (player == null) {
            log.warn("Game {}: Client {} is not a known player", gameId, client.getId());
            return;
        }
        if (state != State.Started) {
            log.warn("Game {}: Ignoring type in state {}", gameId, state);
            return;
        }
        if (!isTypeRound()) {
            log.warn("Game {}: Ignoring type in draw round {}", gameId, round);
            return;
        }
        if (Strings.isEmpty(typeAction.text)) {
            throw new IllegalArgumentException("Empty text");
        }

        Story story = getCurrentStoryForPlayer(player);
        story.elements[round] = StoryElement.createTextElement(typeAction.text);

        checkAndHandleRoundFinished();

        updateStateForAllPlayers();
    }

    private Story getCurrentStoryForPlayer(Player player) {
        return getStoryByIndex(getCurrentStoryIndexForPlayer(player));
    }

    private int getCurrentStoryIndexForPlayer(Player player) {
        // TODO need nicer method to find index of player
        return gameMatrix[round][new ArrayList<>(players.values()).indexOf(player)];
    }

    private boolean isCurrentRoundFinished() {
        return Arrays.stream(stories).allMatch(s -> s.elements[round] != null);
    }

    private boolean isTypeRound() {
        return isTypeRound(round);
    }

    private boolean isDrawRound() {
        return !isTypeRound();
    }

    private static boolean isTypeRound(int roundNo) {
        return roundNo % 2 == 0;
    }

    public synchronized void draw(Client client, ByteBuffer image) throws IOException {
        Player player = clientToPlayer.get(client);
        if (player == null) {
            log.warn("Game {}: Client {} is not a known player", gameId, client.getId());
            return;
        }
        if (state != State.Started) {
            log.warn("Game {}: Ignoring draw in state {}", gameId, state);
            return;
        }
        if (!isDrawRound()) {
            log.warn("Game {}: Ignoring draw in type round {}", gameId, round);
            return;
        }

        Story story = getCurrentStoryForPlayer(player);

        // TODO check that the player did not already send an image? (make consistent with type(.))

        String imageName = UUID.randomUUID().toString() + ".png";
        Path imagePath = gameDir.resolve(imageName);

        // TODO would be better to do the actual writing outside of the synchronized lock (but has to be done carefully)
        try (ByteChannel channel =
                     Files.newByteChannel(imagePath, EnumSet.of(StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE))) {
            channel.write(image);
        }

        story.elements[round] = StoryElement.createImageElement(imageName);

        checkAndHandleRoundFinished();

        updateStateForAllPlayers();
    }

    private void checkAndHandleRoundFinished() {
        if (isCurrentRoundFinished()) {
            round = round + 1;

            if (isGameFinished()) {
                state = State.Finished;
            }
        }
    }

    private boolean isGameFinished() {
        return round >= gameMatrix.length;
    }

    public enum State {
        WaitingForPlayers,
        Started,
        Finished
    }
}

package net.czedik.hermann.tdt;

import net.czedik.hermann.tdt.actions.AccessAction;
import net.czedik.hermann.tdt.actions.JoinAction;
import net.czedik.hermann.tdt.actions.TypeAction;
import net.czedik.hermann.tdt.playerstate.*;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.logging.log4j.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.stream.Collectors;

public class Game {
    private static final Logger log = LoggerFactory.getLogger(Game.class);

    // TODO synchronization

    public final String gameId;

    private final Map<String, Player> players = new LinkedHashMap<>();

    private final Map<Client, Player> clientToPlayer = new HashMap<>();

    /**
     * Current round number (zero based)
     */
    private int round = 0;

    private State state = State.WaitingForPlayers;

    private int[][] gameMatrix = null;

    private Story[] stories = null;

    public Game(String gameId, Player creator) {
        this.gameId = Objects.requireNonNull(gameId);
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
        if (state == State.WaitingForPlayers) {
            List<PlayerInfo> playerInfos = mapPlayersToPlayerInfos(players.values());
            if (player.isCreator) {
                return new WaitForPlayersState(playerInfos);
            } else {
                return new WaitForGameStartState(playerInfos);
            }
        } else if (state == State.Started) {
            if (!hasPlayerFinishedCurrentRound(player)) {
                if (isTypeRound()) {
                    // TODO need to add artwork (if it is not the first round)
                    return new TypeState(round + 1, gameMatrix.length);
                } else {
                    int storyIndex = getCurrentStoryIndexForPlayer(player);
                    String text = getStoryByIndex(storyIndex).elements[round - 1].content;
                    Player previousPlayer = getPreviousPlayerForStory(storyIndex);
                    return new DrawState(round + 1, gameMatrix.length, text, mapPlayerToPlayerInfo(previousPlayer));
                }
            } else {
                List<Player> playersNotFinished = getNotFinishedPlayers();
                return new WaitForRoundFinishState(mapPlayersToPlayerInfos(playersNotFinished), isTypeRound());
            }
        } else {
            // TODO
            throw new IllegalStateException();
        }
    }

    private Player getPreviousPlayerForStory(int storyIndex) {
        int previousPlayerIndexForStory = ArrayUtils.indexOf(gameMatrix[round - 1], storyIndex);
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
        if (player != null) {
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
    }

    public synchronized void start(Client client) {
        Player player = clientToPlayer.get(client);
        if (player == null) {
            log.warn("Game {}: Client {} is not a known player", gameId, client.getId());
            return;
        }
        if (state == State.WaitingForPlayers) {
            if (player.isCreator) {
                if (players.size() > 1) {
                    startGame();
                } else {
                    log.warn("Game {}: Cannot start game with less than 2 players", gameId);
                    updateStateForAllPlayers();
                }
            } else {
                log.warn("Game {}: Non-creator {} cannot start the game (client: {})", gameId, player.id, client.getId());
            }
        } else {
            log.warn("Game {}: Ignoring start in state {}", gameId, state);
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
        if (Strings.isEmpty(typeAction.text)) {
            throw new IllegalArgumentException("Empty text");
        }
        if (state == State.Started) {
            if (isTypeRound()) {
                Story story = getCurrentStoryForPlayer(player);
                story.elements[round] = StoryElement.createTextElement(typeAction.text);

                if (isCurrentRoundFinished()) {
                    round = round + 1;
                    // TODO handle case that we are at the end of the game
                }

                updateStateForAllPlayers();
            } else {
                log.warn("Game {}: Ignoring type in draw round {}", gameId, round);
            }
        } else {
            log.warn("Game {}: Ignoring type in state {}", gameId, state);
        }
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

    private static boolean isTypeRound(int roundNo) {
        return roundNo % 2 == 0;
    }

    public enum State {
        WaitingForPlayers,
        Started
    }
}

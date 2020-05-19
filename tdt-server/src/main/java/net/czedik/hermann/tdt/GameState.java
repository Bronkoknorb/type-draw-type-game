package net.czedik.hermann.tdt;

import java.util.ArrayList;
import java.util.List;

/**
 * This one gets stored/read from disk, so be careful with changes, that need to be backwards compatible.
 */
public class GameState {
    public List<Player> players = new ArrayList<>();

    /**
     * Current round number (zero based)
     */
    public int round = 0;

    public State state = State.WaitingForPlayers;

    public int[][] gameMatrix = null;

    public Story[] stories = null;

    public enum State {
        WaitingForPlayers,
        Started,
        Finished
    }
}

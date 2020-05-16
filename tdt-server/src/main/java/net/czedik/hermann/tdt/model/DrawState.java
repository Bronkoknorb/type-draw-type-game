package net.czedik.hermann.tdt.model;

import java.util.Objects;

public class DrawState implements PlayerState {

    /**
     * Current round number (1-based)
     */
    public final int round;

    /**
     * Total number of rounds
     */
    public final int rounds;

    /**
     * Text that should be drawn
     */
    public final String text;

    public DrawState(int round, int rounds, String text) {
        this.round = round;
        this.rounds = rounds;
        this.text = Objects.requireNonNull(text);
    }

    @Override
    public String getState() {
        return "draw";
    }
}

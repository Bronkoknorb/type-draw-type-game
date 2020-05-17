package net.czedik.hermann.tdt.playerstate;

import net.czedik.hermann.tdt.PlayerInfo;

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

    public final PlayerInfo textWriter;

    public DrawState(int round, int rounds, String text, PlayerInfo textWriter) {
        if (round < 1)
            throw new IllegalArgumentException("Round must be positive number");
        this.round = round;
        this.rounds = rounds;
        this.text = Objects.requireNonNull(text);
        this.textWriter = Objects.requireNonNull(textWriter);
    }

    @Override
    public String getState() {
        return "draw";
    }
}

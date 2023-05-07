package net.czedik.hermann.tdt.playerstate;

import java.util.Objects;

import net.czedik.hermann.tdt.PlayerInfo;

/**
 * DrawState
 * 
 * @param round      Current round number (1-based)
 * @param rounds     Total number of rounds
 * @param text       Text that should be drawn
 * @param textWriter author of the text
 */
public record DrawState(
        int round,
        int rounds,
        String text,
        PlayerInfo textWriter) implements PlayerState {

    public DrawState {
        if (round < 1)
            throw new IllegalArgumentException("Round must be positive number");
        Objects.requireNonNull(text);
        Objects.requireNonNull(textWriter);
    }

    @Override
    public String getState() {
        return "draw";
    }
}

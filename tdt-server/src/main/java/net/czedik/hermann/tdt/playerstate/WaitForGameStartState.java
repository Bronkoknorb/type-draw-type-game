package net.czedik.hermann.tdt.playerstate;

import java.util.List;
import java.util.Objects;

import net.czedik.hermann.tdt.PlayerInfo;

public record WaitForGameStartState(List<PlayerInfo> players) implements PlayerState {

    public WaitForGameStartState {
        Objects.requireNonNull(players);
    }

    @Override
    public String getState() {
        return "waitForGameStart";
    }
}

package net.czedik.hermann.tdt.model;

import java.util.List;
import java.util.Objects;

public class WaitForGameStartState implements PlayerState {
    public List<PlayerInfo> players;

    public WaitForGameStartState(List<PlayerInfo> players) {
        this.players = Objects.requireNonNull(players);
    }

    @Override
    public String getState() {
        return "waitForGameStart";
    }
}

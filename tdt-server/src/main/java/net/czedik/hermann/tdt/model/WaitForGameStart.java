package net.czedik.hermann.tdt.model;

import java.util.List;
import java.util.Objects;

public class WaitForGameStart implements PlayerState {
    @Override
    public String getState() {
        return "waitForGameStart";
    }

    public List<PlayerInfo> players;

    public WaitForGameStart(List<PlayerInfo> players) {
        this.players = Objects.requireNonNull(players);
    }
}

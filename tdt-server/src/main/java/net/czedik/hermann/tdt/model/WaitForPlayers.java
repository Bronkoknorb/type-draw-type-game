package net.czedik.hermann.tdt.model;

import java.util.List;
import java.util.Objects;

public class WaitForPlayers implements PlayerState {
    public List<PlayerInfo> players;

    public WaitForPlayers(List<PlayerInfo> players) {
        this.players = Objects.requireNonNull(players);
    }

    @Override
    public String getState() {
        return "waitForPlayers";
    }
}

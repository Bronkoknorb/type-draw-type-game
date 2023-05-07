package net.czedik.hermann.tdt.playerstate;

import java.util.List;
import java.util.Objects;

import net.czedik.hermann.tdt.PlayerInfo;

public record WaitForPlayersState(List<PlayerInfo> players) implements PlayerState {

    public WaitForPlayersState {
        Objects.requireNonNull(players);
    }

    @Override
    public String getState() {
        return "waitForPlayers";
    }
}

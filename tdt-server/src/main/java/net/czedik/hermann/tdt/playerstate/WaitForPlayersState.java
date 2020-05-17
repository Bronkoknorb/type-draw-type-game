package net.czedik.hermann.tdt.playerstate;

import net.czedik.hermann.tdt.PlayerInfo;

import java.util.List;
import java.util.Objects;

public class WaitForPlayersState implements PlayerState {
    public List<PlayerInfo> players;

    public WaitForPlayersState(List<PlayerInfo> players) {
        this.players = Objects.requireNonNull(players);
    }

    @Override
    public String getState() {
        return "waitForPlayers";
    }
}

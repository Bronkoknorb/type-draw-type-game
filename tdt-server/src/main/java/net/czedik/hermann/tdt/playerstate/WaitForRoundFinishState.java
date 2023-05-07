package net.czedik.hermann.tdt.playerstate;

import java.util.List;
import java.util.Objects;

import net.czedik.hermann.tdt.PlayerInfo;

public record WaitForRoundFinishState(List<PlayerInfo> waitingForPlayers, boolean isTypeRound) implements PlayerState {

    public WaitForRoundFinishState {
        Objects.requireNonNull(waitingForPlayers);
    }

    @Override
    public String getState() {
        return "waitForRoundFinish";
    }
}

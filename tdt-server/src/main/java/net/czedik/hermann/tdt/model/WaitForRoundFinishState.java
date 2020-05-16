package net.czedik.hermann.tdt.model;

import java.util.List;
import java.util.Objects;

public class WaitForRoundFinishState implements PlayerState {

    public final List<PlayerInfo> waitingForPlayers;
    public final boolean isTypeRound;

    public WaitForRoundFinishState(List<PlayerInfo> waitingForPlayers, boolean isTypeRound) {
        this.waitingForPlayers = Objects.requireNonNull(waitingForPlayers);
        this.isTypeRound = isTypeRound;
    }

    @Override
    public String getState() {
        return "waitForRoundFinish";
    }
}

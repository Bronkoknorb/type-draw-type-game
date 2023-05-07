package net.czedik.hermann.tdt.playerstate;

public record JoinState() implements PlayerState {
    @Override
    public String getState() {
        return "join";
    }
}

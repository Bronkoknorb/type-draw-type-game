package net.czedik.hermann.tdt.playerstate;

public record UnknownGameState() implements PlayerState {
    @Override
    public String getState() {
        return "unknownGame";
    }
}

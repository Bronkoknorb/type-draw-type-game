package net.czedik.hermann.tdt.playerstate;

public class UnknownGameState implements PlayerState {
    @Override
    public String getState() {
        return "unknownGame";
    }
}

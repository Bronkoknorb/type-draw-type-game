package net.czedik.hermann.tdt.playerstate;

public class AlreadyStartedGameState implements PlayerState {
    @Override
    public String getState() {
        return "alreadyStartedGame";
    }
}

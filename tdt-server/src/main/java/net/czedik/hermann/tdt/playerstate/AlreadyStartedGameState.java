package net.czedik.hermann.tdt.playerstate;

public record AlreadyStartedGameState() implements PlayerState {
    @Override
    public String getState() {
        return "alreadyStartedGame";
    }
}

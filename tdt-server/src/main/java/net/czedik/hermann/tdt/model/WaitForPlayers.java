package net.czedik.hermann.tdt.model;

public class WaitForPlayers implements PlayerState {
    @Override
    public String getState() {
        return "waitForPlayers";
    }
}

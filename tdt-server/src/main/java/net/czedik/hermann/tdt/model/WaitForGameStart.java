package net.czedik.hermann.tdt.model;

public class WaitForGameStart implements PlayerState {
    @Override
    public String getState() {
        return "waitForGameStart";
    }
}

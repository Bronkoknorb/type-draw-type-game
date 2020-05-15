package net.czedik.hermann.tdt.model;

public class TypeFirstState implements PlayerState {
    public final int rounds;

    public TypeFirstState(int rounds) {
        this.rounds = rounds;
    }

    @Override
    public String getState() {
        return "typeFirst";
    }
}

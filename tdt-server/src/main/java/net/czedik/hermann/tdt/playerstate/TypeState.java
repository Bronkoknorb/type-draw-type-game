package net.czedik.hermann.tdt.playerstate;

public class TypeState implements PlayerState {

    /**
     * Current round number (1-based)
     */
    public final int round;

    /**
     * Total number of rounds
     */
    public final int rounds;

    public TypeState(int round, int rounds) {
        this.round = round;
        this.rounds = rounds;
    }

    @Override
    public String getState() {
        return "type";
    }
}

package net.czedik.hermann.tdt;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class Game {
    public final String gameId;
    public final List<Player> players = new ArrayList<>();

    public Game(String gameId, Player creator) {
        this.gameId = Objects.requireNonNull(gameId);
        players.add(Objects.requireNonNull(creator));
    }
}

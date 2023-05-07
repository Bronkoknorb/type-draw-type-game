package net.czedik.hermann.tdt;

import java.util.Objects;

public record Player(String id, String name, String face, boolean isCreator) {
    public Player {
        Objects.requireNonNull(id);
        Objects.requireNonNull(name);
        Objects.requireNonNull(face);
    }
}

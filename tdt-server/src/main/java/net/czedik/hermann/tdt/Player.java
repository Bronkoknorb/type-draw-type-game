package net.czedik.hermann.tdt;

import java.util.Objects;

public class Player {
    public final String id;
    public final String name;
    public final String face;
    public final boolean isCreator;

    public Player(String id, String name, String face, boolean isCreator) {
        this.id = Objects.requireNonNull(id);
        this.name = Objects.requireNonNull(name);
        this.face = Objects.requireNonNull(face);
        this.isCreator = isCreator;
    }
}

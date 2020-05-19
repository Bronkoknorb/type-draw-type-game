package net.czedik.hermann.tdt;

import java.util.Objects;

public class Player {
    public final String id;
    public final String name;
    public final String avatar;
    public final boolean isCreator;

    public Player(String id, String name, String avatar, boolean isCreator) {
        this.id = Objects.requireNonNull(id);
        this.name = Objects.requireNonNull(name);
        this.avatar = Objects.requireNonNull(avatar);
        this.isCreator = isCreator;
    }
}

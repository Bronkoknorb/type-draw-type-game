package net.czedik.hermann.tdt;

import java.util.Objects;

public class PlayerInfo {
    // on purpose this one does not include the userId, because it goes to the
    // frontend (for all players) and the userId should be secret

    public final String name;
    public final String face;
    public final boolean isCreator;

    public PlayerInfo(String name, String face, boolean isCreator) {
        this.name = Objects.requireNonNull(name);
        this.face = Objects.requireNonNull(face);
        this.isCreator = isCreator;
    }
}

package net.czedik.hermann.tdt;

import java.util.Objects;

public record PlayerInfo(String name, String face, boolean isCreator) {
    // on purpose this one does not include the userId, because it goes to the
    // frontend (for all players) and the userId should be secret

    public PlayerInfo {
        Objects.requireNonNull(name);
        Objects.requireNonNull(face);
    }
}

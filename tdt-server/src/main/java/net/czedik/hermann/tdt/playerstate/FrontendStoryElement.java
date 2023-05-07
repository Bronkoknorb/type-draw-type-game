package net.czedik.hermann.tdt.playerstate;

import java.util.Objects;

import net.czedik.hermann.tdt.PlayerInfo;

public record FrontendStoryElement(String type, String content, PlayerInfo player) {

    public FrontendStoryElement {
        Objects.requireNonNull(type);
        Objects.requireNonNull(content);
        Objects.requireNonNull(player);
    }
}

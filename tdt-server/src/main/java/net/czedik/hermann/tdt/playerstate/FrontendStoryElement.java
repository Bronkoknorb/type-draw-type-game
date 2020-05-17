package net.czedik.hermann.tdt.playerstate;

import net.czedik.hermann.tdt.PlayerInfo;

import java.util.Objects;

public class FrontendStoryElement {
    public String type;
    public String content;
    public PlayerInfo player;

    public FrontendStoryElement(String type, String content, PlayerInfo player) {
        this.type = Objects.requireNonNull(type);
        this.content = Objects.requireNonNull(content);
        this.player = Objects.requireNonNull(player);
    }
}

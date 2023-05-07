package net.czedik.hermann.tdt.playerstate;

import java.util.Objects;

public record FrontendStory(FrontendStoryElement[] elements) {
    public FrontendStory {
        Objects.requireNonNull(elements);
    }
}

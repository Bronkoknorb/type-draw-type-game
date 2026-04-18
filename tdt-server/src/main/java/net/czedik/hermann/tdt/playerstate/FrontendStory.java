package net.czedik.hermann.tdt.playerstate;

import java.util.List;
import java.util.Objects;

public record FrontendStory(List<FrontendStoryElement> elements) {
    public FrontendStory {
        Objects.requireNonNull(elements);
    }
}

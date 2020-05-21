package net.czedik.hermann.tdt;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Objects;

public class Story {
    public final StoryElement[] elements;

    @JsonCreator
    public Story(@JsonProperty("elements") StoryElement[] elements) {
        this.elements = Objects.requireNonNull(elements);
    }

    public Story(int length) {
        this(new StoryElement[length]);
    }
}

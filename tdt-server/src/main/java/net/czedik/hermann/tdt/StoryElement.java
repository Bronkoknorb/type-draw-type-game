package net.czedik.hermann.tdt;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Objects;

public class StoryElement {
    public final String type;
    public final String content;

    @JsonCreator
    private StoryElement(@JsonProperty("type") String type, @JsonProperty("content") String content) {
        this.type = Objects.requireNonNull(type);
        this.content = Objects.requireNonNull(content);
    }

    public static StoryElement createImageElement(String filename) {
        return new StoryElement("image", filename);
    }

    public static StoryElement createTextElement(String text) {
        return new StoryElement("text", text);
    }
}

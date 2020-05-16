package net.czedik.hermann.tdt.model;

public class StoryElement {
    public String type;
    public String content;

    public StoryElement(String type, String content) {
        this.type = type;
        this.content = content;
    }

    public static StoryElement createImageElement(String filename) {
        return new StoryElement("image", filename);
    }

    public static StoryElement createTextElement(String text) {
        return new StoryElement("text", text);
    }
}

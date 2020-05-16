package net.czedik.hermann.tdt.model;

public class Story {
    public StoryElement[] elements;

    public Story(int length) {
        elements = new StoryElement[length];
    }
}

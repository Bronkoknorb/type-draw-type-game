package net.czedik.hermann.tdt.playerstate;

public class StoriesState implements PlayerState {
    public FrontendStory[] stories;

    @Override
    public String getState() {
        return "stories";
    }
}

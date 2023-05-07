package net.czedik.hermann.tdt.playerstate;

public record StoriesState(FrontendStory[] stories) implements PlayerState {

    @Override
    public String getState() {
        return "stories";
    }
}

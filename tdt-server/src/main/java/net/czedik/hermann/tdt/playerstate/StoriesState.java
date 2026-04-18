package net.czedik.hermann.tdt.playerstate;

import java.util.List;

public record StoriesState(List<FrontendStory> stories) implements PlayerState {

    @Override
    public String getState() {
        return "stories";
    }
}

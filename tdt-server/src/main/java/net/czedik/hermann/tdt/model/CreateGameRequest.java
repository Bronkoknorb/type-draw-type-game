package net.czedik.hermann.tdt.model;

import javax.validation.constraints.NotBlank;

public class CreateGameRequest {
    @NotBlank
    public String playerId;
    @NotBlank
    public String playerName;
    @NotBlank
    public String playerAvatar;

    @Override
    public String toString() {
        return JSONHelper.objectToJsonString(this);
    }
}

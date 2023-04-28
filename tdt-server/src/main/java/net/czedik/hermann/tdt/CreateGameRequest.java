package net.czedik.hermann.tdt;

import jakarta.validation.constraints.NotBlank;

public class CreateGameRequest {
    @NotBlank
    public String playerId;
    @NotBlank
    public String playerName;
    @NotBlank
    public String playerFace;

    @Override
    public String toString() {
        return JSONHelper.objectToJsonString(this);
    }
}

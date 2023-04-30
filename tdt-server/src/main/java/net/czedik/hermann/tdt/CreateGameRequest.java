package net.czedik.hermann.tdt;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateGameRequest {
    public static final int MAX_PLAYERID_LENGTH = 50;
    public static final int MAX_NAME_LENGTH = 50;
    public static final int MAX_FACE_LENGTH = 1;

    @NotBlank
    @Size(max = MAX_PLAYERID_LENGTH)
    public String playerId;

    @NotBlank
    @Size(max = MAX_NAME_LENGTH)
    public String playerName;

    @NotBlank
    @Size(max = MAX_FACE_LENGTH)
    public String playerFace;

    @Override
    public String toString() {
        return JSONHelper.objectToJsonString(this);
    }
}

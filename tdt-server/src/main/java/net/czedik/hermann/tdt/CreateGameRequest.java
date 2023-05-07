package net.czedik.hermann.tdt;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateGameRequest(
        @NotBlank @Size(max = MAX_PLAYERID_LENGTH) String playerId,
        @NotBlank @Size(max = MAX_NAME_LENGTH) String playerName,
        @NotBlank @Size(max = MAX_FACE_LENGTH) String playerFace) {
    public static final int MAX_PLAYERID_LENGTH = 50;
    public static final int MAX_NAME_LENGTH = 50;
    public static final int MAX_FACE_LENGTH = 1;
}

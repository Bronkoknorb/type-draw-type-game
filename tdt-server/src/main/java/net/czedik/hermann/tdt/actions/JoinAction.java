package net.czedik.hermann.tdt.actions;

import net.czedik.hermann.tdt.CreateGameRequest;

public class JoinAction {
    public String gameId;
    public String playerId;
    public String name;
    public String face;

    public void validate() {
        if (playerId.length() > CreateGameRequest.MAX_PLAYERID_LENGTH)
            throw new IllegalArgumentException("Player ID too long");
        if (name.length() > CreateGameRequest.MAX_NAME_LENGTH)
            throw new IllegalArgumentException("Player Name too long");
        if (face.length() > CreateGameRequest.MAX_FACE_LENGTH)
            throw new IllegalArgumentException("Face length too long");
    }
}

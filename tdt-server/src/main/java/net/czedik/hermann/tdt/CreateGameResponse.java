package net.czedik.hermann.tdt;

public class CreateGameResponse {
    public String gameId;

    public CreateGameResponse(String gameId) {
        this.gameId = gameId;
    }

    @Override
    public String toString() {
        return JSONHelper.objectToJsonString(this);
    }
}

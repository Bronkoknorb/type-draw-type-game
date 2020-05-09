package net.czedik.hermann.tdt.model;

import javax.validation.constraints.NotBlank;

public class CreateGameRequest {
    @NotBlank
    public String userId;
    @NotBlank
    public String userName;
    @NotBlank
    public String userAvatar;

    @Override
    public String toString() {
        return JSONHelper.objectToJsonString(this);
    }
}

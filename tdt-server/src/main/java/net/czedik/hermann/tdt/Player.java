package net.czedik.hermann.tdt;

import java.util.Objects;

public class Player {
    public String userId;
    public String userName;
    public String avatar;

    public Player(String userId, String userName, String avatar) {
        this.userId = Objects.requireNonNull(userId);
        this.userName = Objects.requireNonNull(userName);
        this.avatar = Objects.requireNonNull(avatar);
    }
}

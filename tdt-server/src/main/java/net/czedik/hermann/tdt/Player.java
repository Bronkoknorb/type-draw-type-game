package net.czedik.hermann.tdt;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class Player {
    public final String userId;
    public final String userName;
    public final String avatar;
    public final boolean isCreator;

    // TODO check sync

    private Set<Client> clients = new HashSet<>();

    public Player(String userId, String userName, String avatar, boolean isCreator) {
        this.userId = Objects.requireNonNull(userId);
        this.userName = Objects.requireNonNull(userName);
        this.avatar = Objects.requireNonNull(avatar);
        this.isCreator = isCreator;
    }

    public void addClient(Client client) {
        clients.add(client);
    }
}

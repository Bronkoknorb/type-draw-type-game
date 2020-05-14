package net.czedik.hermann.tdt;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class Player {
    public final String id;
    public final String name;
    public final String avatar;
    public final boolean isCreator;

    // TODO check sync

    // TODO make sure to remove clients again when they disconnect
    public Set<Client> clients = new HashSet<>();

    public Player(String id, String name, String avatar, boolean isCreator) {
        this.id = Objects.requireNonNull(id);
        this.name = Objects.requireNonNull(name);
        this.avatar = Objects.requireNonNull(avatar);
        this.isCreator = isCreator;
    }

    public void addClient(Client client) {
        clients.add(client);
    }
}

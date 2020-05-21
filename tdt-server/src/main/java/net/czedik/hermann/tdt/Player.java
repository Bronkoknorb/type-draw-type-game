package net.czedik.hermann.tdt;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Objects;

public class Player {
    public final String id;
    public final String name;
    public final String face;
    public final boolean isCreator;

    @JsonCreator
    public Player(@JsonProperty("id") String id,
                  @JsonProperty("name") String name,
                  @JsonProperty("face") String face,
                  @JsonProperty("isCreator") boolean isCreator) {
        this.id = Objects.requireNonNull(id);
        this.name = Objects.requireNonNull(name);
        this.face = Objects.requireNonNull(face);
        this.isCreator = isCreator;
    }
}

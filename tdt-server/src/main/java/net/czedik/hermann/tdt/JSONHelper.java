package net.czedik.hermann.tdt;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

public class JSONHelper {
    public static final ObjectMapper objectMapper = new ObjectMapper();

    private JSONHelper() {
        // hide constructor
    }

    public static String objectToJsonString(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JacksonException e) {
            // error handling of the lazy programmer
            throw new IllegalArgumentException(e);
        }
    }

    public static JsonNode stringToJsonNode(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (JacksonException e) {
            // error handling of the lazy programmer
            throw new IllegalArgumentException(e);
        }
    }
}

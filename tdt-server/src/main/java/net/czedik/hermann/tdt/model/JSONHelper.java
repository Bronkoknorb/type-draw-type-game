package net.czedik.hermann.tdt.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JSONHelper {
    public static final ObjectMapper objectMapper = new ObjectMapper();

    private JSONHelper() {
        // hide constructor
    }

    public static String objectToJsonString(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            // error handling of the lazy programmer
            throw new IllegalArgumentException(e);
        }
    }

    public static JsonNode stringToJsonNode (String json) {
        try {
            return objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            // error handling of the lazy programmer
            throw new IllegalArgumentException(e);
        }
    }
}

package net.czedik.hermann.tdt;

import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class GameManagerTests {

    @Test
    @SuppressWarnings("NullAway")
    void testValidateNullGameId() {
        assertThrows(NullPointerException.class, () -> GameManager.validateGameId(null));
    }

    @Test
    void testValidateGameId() {
        GameManager.validateGameId("abcde"); // valid
        
        assertThrows(IllegalArgumentException.class, () -> GameManager.validateGameId(""));
        assertThrows(IllegalArgumentException.class, () -> GameManager.validateGameId("abcd"));
        assertThrows(IllegalArgumentException.class, () -> GameManager.validateGameId("abcdef"));
        assertThrows(IllegalArgumentException.class, () -> GameManager.validateGameId("ab.de"));
        assertThrows(IllegalArgumentException.class, () -> GameManager.validateGameId("ab-de"));
        assertThrows(IllegalArgumentException.class, () -> GameManager.validateGameId("ab_de"));
        assertThrows(IllegalArgumentException.class, () -> GameManager.validateGameId("abćde"));
        assertThrows(IllegalArgumentException.class, () -> GameManager.validateGameId("ab♥de"));
        assertThrows(IllegalArgumentException.class, () -> GameManager.validateGameId("abcdl"));
    }

}

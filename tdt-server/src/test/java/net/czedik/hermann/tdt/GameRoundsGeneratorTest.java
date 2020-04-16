package net.czedik.hermann.tdt;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

class GameRoundsGeneratorTest {

    /**
     * Set to true to print out the games and more debugging information during testing.
     */
    private static final boolean PRINT_DEBUG_INFO = false;

    @Test
    void generateValidGames() {
        int maxNumberOfPlayers = 20;

        for (int numberOfPlayers = 2; numberOfPlayers <= maxNumberOfPlayers; numberOfPlayers++) {
            int[][] rounds = GameRoundsGenerator.generate(numberOfPlayers);

            printMatrixIfEnabled("Game:", rounds);

            validateGame(numberOfPlayers, rounds);

            int[][] transitions = calculateTransitions(rounds);

            printMatrixIfEnabled("Transitions:", transitions);

            // for even number of players, also check that the game is "perfect" (i.e. that you get a story from every
            // other player exactly once.)
            if (numberOfPlayers % 2 == 0) {
                checkThatGameIsPerfect(numberOfPlayers, transitions);
            }
            // for odd numbers a perfect game is not possible
        }
    }

    private void validateGame(int numberOfPlayers, int[][] rounds) {
        assertRoundsAndAssignmentLengths(numberOfPlayers, rounds);

        // check that each round contains every story (and therefore also no story more than once)
        assertAllRoundsContainEveryStory(rounds);

        // check that no player gets the same story twice (and therefore that every player participates in every
        // story exactly once)
        checkAllPlayersPlayEveryStory(rounds);
    }

    private void checkAllPlayersPlayEveryStory(int[][] rounds) {
        Set<Integer> allStoryNumbers = IntStream.range(0, rounds.length).boxed().collect(Collectors.toSet());
        for (int p = 0; p < rounds.length; p++) {
            Set<Integer> storiesOfPlayer = new HashSet<>();
            for (int[] round : rounds) {
                storiesOfPlayer.add(round[p]);
            }
            Assertions.assertEquals(allStoryNumbers, storiesOfPlayer, "Player needs to play all stories");
        }
    }

    private void assertAllRoundsContainEveryStory(int[][] rounds) {
        Set<Integer> allStoryNumbers = IntStream.range(0, rounds.length).boxed().collect(Collectors.toSet());
        for (int[] round : rounds) {
            Set<Integer> storiesInRound = Arrays.stream(round).boxed().collect(Collectors.toSet());
            Assertions.assertEquals(allStoryNumbers, storiesInRound, "Round needs to contain all stories");
        }
    }

    private void printMatrixIfEnabled(String message, int[][] rounds) {
        if (PRINT_DEBUG_INFO) {
            System.out.println(message);
            Stream.of(rounds).forEach(r -> System.out.println(Arrays.toString(r)));
            System.out.println();
        }
    }

    private void assertRoundsAndAssignmentLengths(int numberOfPlayers, int[][] rounds) {
        Assertions.assertEquals(numberOfPlayers, rounds.length);
        for (int[] round : rounds) {
            Assertions.assertEquals(numberOfPlayers, round.length);
        }
    }

    private void checkThatGameIsPerfect(int numberOfPlayers, int[][] transitions) {
        Set<Integer> allPlayerNumbers = IntStream.range(0, numberOfPlayers).boxed().collect(Collectors.toSet());
        for (int p = 0; p < numberOfPlayers; p++) {
            Set<Integer> transitionsOfPlayer = new HashSet<>();
            for (int[] transitionsInRound : transitions) {
                transitionsOfPlayer.add(transitionsInRound[p]);
            }
            Set<Integer> allPlayerNumbersWithoutThemselves = new HashSet<>(allPlayerNumbers);
            allPlayerNumbersWithoutThemselves.remove(p);
            Assertions.assertEquals(allPlayerNumbersWithoutThemselves, transitionsOfPlayer, "Player needs to transition (hand a story over) to every other player");
        }
    }

    private int[][] calculateTransitions(int[][] rounds) {
        int[][] transitions = new int[rounds.length - 1][];

        for (int r = 0; r < rounds.length - 1; r++) {
            int[] currentRound = rounds[r];
            int[] nextRound = rounds[r + 1];
            List<Integer> nextRoundAsList = Arrays.stream(nextRound).boxed().collect(Collectors.toList());

            transitions[r] = new int[currentRound.length];

            for (int p = 0; p < currentRound.length; p++) {
                int story = currentRound[p];
                int goesToPlayer = nextRoundAsList.indexOf(story);
                transitions[r][p] = goesToPlayer;
            }
        }
        return transitions;
    }

    @Test
    void generateThrowsOnIllegalArgument() {
        Assertions.assertThrows(IllegalArgumentException.class, () -> GameRoundsGenerator.generate(-1));
        Assertions.assertThrows(IllegalArgumentException.class, () -> GameRoundsGenerator.generate(0));
        Assertions.assertThrows(IllegalArgumentException.class, () -> GameRoundsGenerator.generate(1));
    }
}

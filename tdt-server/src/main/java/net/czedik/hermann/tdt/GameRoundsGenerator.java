package net.czedik.hermann.tdt;

import java.util.Arrays;
import java.util.Collections;
import java.util.stream.IntStream;

public class GameRoundsGenerator {

    /**
     * Generates a game matrix for the given number of players which determines how "Stories" are passed between the
     * players round by round.
     *
     * @param numberOfPlayers number of players (must not be less than 2)
     * @return game matrix, the first index corresponds to the round number. The second index to the player number.
     *   The matrix is always quadratic as the number of rounds corresponds to the number of players. The entries within
     *   the matrix are a number from 0 to numberOfPlayers (identifying a Story that is passed between the players).
     */
    public static int[][] generate(int numberOfPlayers) {
        if (numberOfPlayers < 2)
            throw new IllegalArgumentException("Can only generate game for 2 or more players");

        int[][] rounds = initMatrix(numberOfPlayers);

        if (numberOfPlayers % 2 == 0) {
            generateForEven(numberOfPlayers, rounds);
        } else {
            generateForOdd(numberOfPlayers, rounds);
        }

        return rounds;
    }

    private static void generateForEven(int numberOfPlayers, int[][] rounds) {
        // first round is easy, every player gets the story corresponding to their number
        rounds[0] = IntStream.range(0, numberOfPlayers).toArray();

        /* This is an algorithm to generate a "perfect" game for an even number of players:
         (A perfect game means, that you get a story from every other player exactly once.)
         After the first round, if you are player p (with p from 0 to the total number of players), you hand your story
         over to player p+1 (modulo the number of players), after the second round to player p-2, then to p+3, then to
         p-4, then to p+5 and so on (always modulo the number of players), until the game is over (the number of rounds
         corresponds to the number of player (and also stories), because we want every player to participate in every
         story). (Sitting on a round table this could look like this: first hand the paper/story to the player right of
         you, then the next one to the player sitting two places left of you, then to the player sitting three places
         right of you, and so on. */
        int sign = 1;
        for (int r = 0; r < rounds.length - 1; r++) {
            int[] currentRound = rounds[r];
            int[] nextRound = rounds[r + 1];
            for (int p = 0; p < currentRound.length; p++) {
                nextRound[Math.floorMod(p + (r + 1) * sign, nextRound.length)] = currentRound[p];
            }
            sign *= -1;
        }
    }

    private static void generateForOdd(int numberOfPlayers, int[][] rounds) {

        // a "perfect" game is not possible for odd numbers.
        // it would be nice to find an algorithm that at least generates a "near-perfect" game, i.e. so that you get a
        // story the least often from the same player, but I haven found one yet.
        // Therefore instead, for now generate a valid game by first always just handing over to the next player;
        // and then shuffle the rounds, to at least make a bit better.

        rounds[0] = IntStream.range(0, numberOfPlayers).toArray();
        for (int r = 0; r < rounds.length - 1; r++) {
            int[] currentRound = rounds[r];
            int[] nextRound = rounds[r + 1];
            for (int p = 0; p < currentRound.length; p++) {
                nextRound[Math.floorMod(p + 1, nextRound.length)] = currentRound[p];
            }
        }

        Collections.shuffle(Arrays.asList(rounds).subList(1, rounds.length));
        // yes, that works, as Arrays.asList(.) and subList(.) write "through" to the array
    }

    private static int[][] initMatrix(int numberOfPlayers) {
        int[][] rounds = new int[numberOfPlayers][];
        for (int round = 0; round < rounds.length; round++) {
            rounds[round] = new int[numberOfPlayers];
        }
        return rounds;
    }
}

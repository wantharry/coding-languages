package com.interviewprep.concurrency;

/**
 * MULTITHREADING BASICS: Runnable/Thread, and `synchronized` as the fix for a
 * real race condition.
 *
 * We spin up THREAD_COUNT threads, each incrementing a shared counter
 * INCREMENTS_PER_THREAD times, then join() all of them and compare the final
 * count to the mathematically expected total.
 *
 * On the UnsafeCounter, lost updates are expected to make the final count
 * LOWER than expected (it can never be higher -- increments can only be lost,
 * never double-counted, since count++ can only under-count a racing write).
 * The thread/iteration counts below are deliberately large enough (and have
 * been verified by actually running this class) to make the race reliably
 * observable on a real multi-core machine -- it is not a once-in-a-while flake.
 *
 * On the SafeCounter, `synchronized` serializes access to increment(), so the
 * final count always exactly matches the expected total.
 */
public class RaceConditionDemo {
    private static final int THREAD_COUNT = 50;
    private static final int INCREMENTS_PER_THREAD = 100_000;
    private static final int EXPECTED_TOTAL = THREAD_COUNT * INCREMENTS_PER_THREAD;

    public static void main(String[] args) throws InterruptedException {
        System.out.println("Expected total either way: " + EXPECTED_TOTAL);

        System.out.println();
        System.out.println("--- WITHOUT synchronization (UnsafeCounter) ---");
        UnsafeCounter unsafeCounter = new UnsafeCounter();
        runConcurrently(unsafeCounter::increment);
        int unsafeResult = unsafeCounter.get();
        System.out.println("Actual total: " + unsafeResult);
        if (unsafeResult != EXPECTED_TOTAL) {
            System.out.println("RACE CONDITION CONFIRMED: lost " + (EXPECTED_TOTAL - unsafeResult)
                    + " increments due to unsynchronized concurrent read-modify-write.");
        } else {
            System.out.println("(No lost updates observed this run -- race conditions are timing-"
                    + "dependent; rerun, or increase THREAD_COUNT/INCREMENTS_PER_THREAD, to see it.)");
        }

        System.out.println();
        System.out.println("--- WITH synchronization (SafeCounter) ---");
        SafeCounter safeCounter = new SafeCounter();
        runConcurrently(safeCounter::increment);
        int safeResult = safeCounter.get();
        System.out.println("Actual total: " + safeResult);
        System.out.println(safeResult == EXPECTED_TOTAL
                ? "CORRECT: synchronized prevented every lost update."
                : "UNEXPECTED: synchronized should have made this always match.");
    }

    /** Runs the given Runnable INCREMENTS_PER_THREAD times on each of THREAD_COUNT threads. */
    private static void runConcurrently(Runnable incrementAction) throws InterruptedException {
        Thread[] threads = new Thread[THREAD_COUNT];
        for (int i = 0; i < THREAD_COUNT; i++) {
            // Runnable + Thread: the classic way to define a unit of work and run it
            // on its own thread of execution.
            Runnable task = () -> {
                for (int j = 0; j < INCREMENTS_PER_THREAD; j++) {
                    incrementAction.run();
                }
            };
            threads[i] = new Thread(task);
        }
        for (Thread t : threads) t.start();
        for (Thread t : threads) t.join(); // wait for every thread to finish before checking the result
    }
}

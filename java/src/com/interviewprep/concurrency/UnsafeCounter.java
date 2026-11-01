package com.interviewprep.concurrency;

/**
 * NOT thread-safe. count++ is really three separate steps -- read count,
 * compute count+1, write it back -- and those steps are NOT atomic. If two
 * threads interleave between the read and the write, both can read the same
 * value, both compute the same +1, and both write back the same result,
 * silently losing one of the two increments. This is a classic "lost update"
 * race condition. See RaceConditionDemo for a live, reliably-observable
 * demonstration.
 */
public class UnsafeCounter {
    private int count = 0;

    public void increment() {
        count++; // read-modify-write, NOT atomic
    }

    public int get() {
        return count;
    }
}

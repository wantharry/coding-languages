package com.interviewprep.concurrency;

/**
 * Thread-safe equivalent of UnsafeCounter, fixed with the `synchronized`
 * keyword. Only one thread at a time can be executing a synchronized method
 * on a given instance (the JVM acquires that object's intrinsic monitor lock
 * on entry and releases it on exit, even if an exception is thrown) -- so the
 * read-modify-write of count++ can no longer be interleaved by another thread.
 */
public class SafeCounter {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }

    public synchronized int get() {
        return count;
    }
}

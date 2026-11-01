package com.interviewprep.exceptions;

/**
 * A custom CHECKED exception: it extends Exception (not RuntimeException), so
 * the compiler forces every caller to either catch it or declare it with
 * `throws`. It models a recoverable business condition (an insufficient
 * balance) that calling code is expected to anticipate and handle -- a
 * reasonable case FOR checked exceptions, as discussed in ExceptionsDemo.
 */
public class InsufficientFundsException extends Exception {
    private final double shortfall;

    public InsufficientFundsException(double shortfall) {
        super("Insufficient funds: short by " + shortfall);
        this.shortfall = shortfall;
    }

    public double getShortfall() {
        return shortfall;
    }
}

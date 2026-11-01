package com.interviewprep.exceptions;

/**
 * A minimal AutoCloseable resource, used to demonstrate try-with-resources
 * without depending on real I/O (files/sockets). close() is guaranteed to run
 * when the try block exits -- normally OR via exception -- which is exactly
 * what try-with-resources buys you over manual try/finally: you can't forget
 * to call close(), and multiple resources close in reverse declaration order
 * automatically, each guaranteed to run even if an earlier close() throws.
 */
public class LoggingResource implements AutoCloseable {
    private final String name;

    public LoggingResource(String name) {
        this.name = name;
        System.out.println("Opening resource: " + name);
    }

    public void use() {
        System.out.println("Using resource: " + name);
    }

    @Override
    public void close() {
        System.out.println("Closing resource: " + name);
    }
}

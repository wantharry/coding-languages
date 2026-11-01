package com.interviewprep.interfaces;

/**
 * An INTERFACE: a pure capability contract with no state and (here) no shared
 * implementation. Any unrelated class can implement it -- a Dog, a Button, a
 * MapIcon -- as long as it can be drawn. Interfaces describe "CAN-DO"
 * relationships rather than "IS-A" ones, and a class can implement many of them
 * (Java has no single-inheritance limit for interfaces, unlike abstract classes).
 */
public interface Drawable {
    void draw();

    // Java 8+ allows default methods, giving interfaces limited shared behavior.
    // Still no instance state is possible, which is the key difference from an
    // abstract class.
    default void drawTwice() {
        draw();
        draw();
    }
}

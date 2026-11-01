package com.interviewprep.generics;

/**
 * A generic CLASS. Box<T> can hold any type while remaining fully type-safe at
 * compile time -- no casts required by callers, unlike pre-Java-5 code that had
 * to use Object and cast everywhere (and could fail at runtime with a
 * ClassCastException on a bad cast).
 */
public class Box<T> {
    private T content;

    public void set(T content) {
        this.content = content;
    }

    public T get() {
        return content;
    }

    @Override
    public String toString() {
        return "Box[" + content + "]";
    }
}

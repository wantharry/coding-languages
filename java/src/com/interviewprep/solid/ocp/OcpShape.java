package com.interviewprep.solid.ocp;

/** GOOD: the extension point. New shapes implement this; no existing code changes. */
public interface OcpShape {
    double area();
}

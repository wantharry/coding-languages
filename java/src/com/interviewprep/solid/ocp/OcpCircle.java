package com.interviewprep.solid.ocp;

public class OcpCircle implements OcpShape {
    private final double radius;

    public OcpCircle(double radius) {
        this.radius = radius;
    }

    @Override
    public double area() {
        return Math.PI * radius * radius;
    }
}

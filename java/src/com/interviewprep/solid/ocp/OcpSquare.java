package com.interviewprep.solid.ocp;

public class OcpSquare implements OcpShape {
    private final double side;

    public OcpSquare(double side) {
        this.side = side;
    }

    @Override
    public double area() {
        return side * side;
    }
}

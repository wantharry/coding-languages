package com.interviewprep.solid.ocp;

/**
 * GOOD: a brand-new shape added WITHOUT touching AreaCalculatorGood,
 * OcpCircle, or OcpSquare at all -- that's "open for extension, closed for
 * modification" in action.
 */
public class OcpTriangle implements OcpShape {
    private final double base;
    private final double height;

    public OcpTriangle(double base, double height) {
        this.base = base;
        this.height = height;
    }

    @Override
    public double area() {
        return 0.5 * base * height;
    }
}

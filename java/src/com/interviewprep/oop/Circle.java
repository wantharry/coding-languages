package com.interviewprep.oop;

/** Concrete Shape: INHERITANCE -- reuses Shape's color/describe() machinery for free. */
public class Circle extends Shape {

    private final double radius;

    public Circle(String color, double radius) {
        super(color);
        this.radius = radius;
    }

    @Override
    public double area() {
        return Math.PI * radius * radius;
    }

    @Override
    public double perimeter() {
        return 2 * Math.PI * radius;
    }
}

package com.interviewprep.oop;

/** Concrete Shape. Note: Square (if it existed) should NOT extend Rectangle --
 *  that's the classic Liskov Substitution violation senior interviews probe:
 *  mutating a Square's width would have to silently mutate its height too,
 *  which breaks the behavioral contract callers of Rectangle.setWidth() rely on. */
public class Rectangle extends Shape {

    private final double width;
    private final double height;

    public Rectangle(String color, double width, double height) {
        super(color);
        this.width = width;
        this.height = height;
    }

    @Override
    public double area() {
        return width * height;
    }

    @Override
    public double perimeter() {
        return 2 * (width + height);
    }
}

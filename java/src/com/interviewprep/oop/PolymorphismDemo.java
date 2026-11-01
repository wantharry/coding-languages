package com.interviewprep.oop;

import java.util.List;

/**
 * POLYMORPHISM via DYNAMIC DISPATCH.
 *
 * The array/list below is typed as List<Shape> -- the COMPILE-TIME type of every
 * element is Shape. But at runtime, each call to area()/perimeter()/describe() is
 * resolved against the object's ACTUAL class (Circle, Rectangle, Triangle) via the
 * JVM's virtual method table -- not against the reference's declared type.
 *
 * This is "dynamic dispatch" / "late binding", and it's the mechanism that makes
 * polymorphism possible: the calling code (this loop) never needs an if/else or a
 * switch on type. Adding a new Shape subclass requires zero changes here -- that's
 * also a preview of the Open/Closed Principle (see com.interviewprep.solid).
 */
public class PolymorphismDemo {
    public static void main(String[] args) {
        List<Shape> shapes = List.of(
                new Circle("Red", 3.0),
                new Rectangle("Blue", 4.0, 5.0),
                new Triangle("Green", 3.0, 4.0, 5.0)
        );

        for (Shape shape : shapes) {
            // 'shape' is declared as Shape, but describe()/area()/perimeter() run
            // the override from the concrete runtime type.
            System.out.println(shape.describe());
        }

        double totalArea = 0;
        for (Shape shape : shapes) {
            totalArea += shape.area();
        }
        System.out.printf("Total area of all shapes: %.2f%n", totalArea);
    }
}

package com.interviewprep.solid.ocp;

/**
 * OPEN/CLOSED PRINCIPLE -- VIOLATION.
 *
 * "Software entities should be open for extension but closed for modification."
 * Here, supporting a NEW shape (e.g. Triangle) means editing this method's
 * if/else chain directly -- modifying existing, already-tested code just to
 * add a new case. Every new shape risks breaking the existing cases and forces
 * a re-review/re-test of a method that "used to work".
 */
public class AreaCalculatorBad {
    public double totalArea(Object[] shapes) {
        double total = 0;
        for (Object shape : shapes) {
            if (shape instanceof BadCircle circle) {
                total += Math.PI * circle.radius() * circle.radius();
            } else if (shape instanceof BadSquare square) {
                total += square.side() * square.side();
            }
            // Adding a Triangle means coming back HERE and adding another
            // else-if branch, modifying code that already shipped.
        }
        return total;
    }

    public record BadCircle(double radius) {}
    public record BadSquare(double side) {}
}

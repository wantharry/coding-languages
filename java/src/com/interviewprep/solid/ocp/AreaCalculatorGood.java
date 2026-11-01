package com.interviewprep.solid.ocp;

/** GOOD: this class never needs to change again, no matter how many new OcpShape
 *  implementations get added -- it relies on polymorphism instead of type-checking. */
public class AreaCalculatorGood {
    public double totalArea(OcpShape[] shapes) {
        double total = 0;
        for (OcpShape shape : shapes) {
            total += shape.area();
        }
        return total;
    }
}

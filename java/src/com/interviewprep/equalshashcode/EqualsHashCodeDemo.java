package com.interviewprep.equalshashcode;

import java.util.HashSet;
import java.util.Set;

public class EqualsHashCodeDemo {
    public static void main(String[] args) {
        System.out.println("--- Correct Point: equals()+hashCode() both overridden ---");
        Set<Point> points = new HashSet<>();
        points.add(new Point(1, 2));
        points.add(new Point(3, 4));

        Point lookup = new Point(1, 2); // a DIFFERENT instance, but logically equal
        boolean found = points.contains(lookup);
        System.out.println("points.contains(new Point(1, 2)) = " + found
                + "  (expected: true -- correct hashCode/equals pair found the match)");

        System.out.println();
        System.out.println("--- Broken: equals() overridden, hashCode() NOT overridden ---");
        Set<BrokenPoint> brokenPoints = new HashSet<>();
        brokenPoints.add(new BrokenPoint(1, 2));
        brokenPoints.add(new BrokenPoint(3, 4));

        BrokenPoint brokenLookup = new BrokenPoint(1, 2); // logically equal, different instance
        boolean brokenFound = brokenPoints.contains(brokenLookup);
        System.out.println("brokenPoints.contains(new BrokenPoint(1, 2)) = " + brokenFound
                + "  (expected: false -- broken hashCode sent it to the wrong bucket)");

        System.out.println();
        System.out.println("Proof of why: identity hash codes differ even though equals() agrees:");
        BrokenPoint a = new BrokenPoint(1, 2);
        BrokenPoint b = new BrokenPoint(1, 2);
        System.out.println("a.equals(b)   = " + a.equals(b) + "  (true, fields match)");
        System.out.println("a.hashCode()  = " + a.hashCode());
        System.out.println("b.hashCode()  = " + b.hashCode() + "  (different from a's -- contract violated)");
    }
}

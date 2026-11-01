package com.interviewprep.equalshashcode;

import java.util.Objects;

/**
 * A CORRECT equals()/hashCode() pair.
 *
 * THE CONTRACT (from Object's javadoc), and why HashMap/HashSet depend on it:
 *   1. If a.equals(b) is true, then a.hashCode() == b.hashCode() MUST also be true.
 *   2. hashCode() must be consistent: calling it multiple times on an unmodified
 *      object must return the same value.
 *   3. equals() must be reflexive, symmetric, transitive, and consistent.
 *
 * WHY breaking it breaks hash-based collections:
 *   HashMap/HashSet first use hashCode() to pick a bucket, THEN use equals() to
 *   find the exact match within that bucket's collisions. If two "equal" objects
 *   produce DIFFERENT hash codes, the set/map will look in the WRONG bucket and
 *   never find the match -- contains()/get() silently return false/null even
 *   though an "equal" element is sitting in the collection. This is a famous,
 *   very real bug class: e.g. overriding equals() but forgetting hashCode()
 *   (or vice versa) -- IDEs and static analyzers flag it for exactly this reason.
 *
 * See BrokenPoint for a class that violates rule #1, and EqualsHashCodeDemo for
 * a live demonstration of both the correct and the broken behavior.
 */
public final class Point {
    private final int x;
    private final int y;

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;              // reflexive short-circuit
        if (!(o instanceof Point)) return false;  // type check (symmetric-safe)
        Point other = (Point) o;
        return x == other.x && y == other.y;      // compare all fields that define equality
    }

    @Override
    public int hashCode() {
        // Built from exactly the same fields used in equals() -- this is the rule
        // that must never be broken: equal objects -> equal hash codes.
        return Objects.hash(x, y);
    }

    @Override
    public String toString() {
        return "Point(" + x + ", " + y + ")";
    }
}

package com.interviewprep.equalshashcode;

/**
 * A DELIBERATELY BROKEN equals()/hashCode() pair, for demonstration only.
 *
 * equals() is overridden (compares x and y), but hashCode() is NOT overridden,
 * so it falls back to Object's default: an identity-based hash that is
 * different for every distinct object instance, regardless of field values.
 *
 * Result: two BrokenPoint instances with identical (x, y) are equal() but have
 * different hashCode()s -- a direct violation of the contract. A HashSet will
 * put them in different buckets and contains() will fail to find a logically
 * equal object. EqualsHashCodeDemo proves this live.
 */
public final class BrokenPoint {
    private final int x;
    private final int y;

    public BrokenPoint(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BrokenPoint)) return false;
        BrokenPoint other = (BrokenPoint) o;
        return x == other.x && y == other.y;
    }

    // Intentionally NOT overriding hashCode() -- this is the bug.
    // (Object.hashCode() default is identity-based.)

    @Override
    public String toString() {
        return "BrokenPoint(" + x + ", " + y + ")";
    }
}

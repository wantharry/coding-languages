package com.interviewprep.generics;

import java.util.List;

/**
 * A generic METHOD with a BOUNDED type parameter: <T extends Comparable<T>>.
 *
 * The bound says "T can be any type, as long as it knows how to compare itself
 * to another T" -- which is exactly what we need to find a max. Without the
 * bound, we couldn't call compareTo() on a plain T.
 *
 * ----------------------------------------------------------------------------
 * TYPE ERASURE, briefly:
 *
 * Generics in Java are a COMPILE-TIME-ONLY feature. The compiler uses T to check
 * your code, then "erases" it: at bytecode/runtime level, List<String> and
 * List<Integer> are both just List, and our T here is erased to its bound
 * (Comparable) or to Object if unbounded. This is why:
 *   - You can't do `new T()` or `new T[]` directly.
 *   - You can't overload methods that differ only by generic type parameter.
 *   - instanceof and reflection can't see the generic type argument at runtime
 *     (e.g. you can check `list instanceof List` but not `instanceof List<String>`).
 *   - Casts the compiler inserts for you (bridge methods) are why you sometimes
 *     see "unchecked cast" warnings.
 * Erasure exists for backward compatibility: it let generics be added in Java 5
 * without breaking all pre-existing bytecode/classes.
 * ----------------------------------------------------------------------------
 */
public class GenericMethods {

    public static <T extends Comparable<T>> T max(List<T> items) {
        if (items.isEmpty()) {
            throw new IllegalArgumentException("Cannot find max of an empty list");
        }
        T largest = items.get(0);
        for (T item : items) {
            if (item.compareTo(largest) > 0) {
                largest = item;
            }
        }
        return largest;
    }
}

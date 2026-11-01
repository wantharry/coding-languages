package com.interviewprep.generics;

import java.util.List;

public class GenericsDemo {
    public static void main(String[] args) {
        Box<String> stringBox = new Box<>();
        stringBox.set("hello generics");
        System.out.println(stringBox);

        Box<Integer> intBox = new Box<>();
        intBox.set(42);
        System.out.println(intBox);

        Pair<String, Integer> pair = new Pair<>("age", 30);
        System.out.println("Pair: " + pair);

        List<Integer> numbers = List.of(4, 9, 1, 7, 3);
        System.out.println("Max of " + numbers + " = " + GenericMethods.max(numbers));

        List<String> words = List.of("banana", "apple", "cherry");
        System.out.println("Max of " + words + " = " + GenericMethods.max(words));

        // At runtime, both List instances above are erased to the same raw List type:
        System.out.println("Erasure check -- same runtime class for List<Integer> and List<String>: "
                + (numbers.getClass() == words.getClass()));
    }
}

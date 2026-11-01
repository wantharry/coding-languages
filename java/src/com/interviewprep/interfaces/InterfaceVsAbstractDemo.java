package com.interviewprep.interfaces;

import java.util.List;

public class InterfaceVsAbstractDemo {
    public static void main(String[] args) {
        List<AbstractAnimal> animals = List.of(new Dog("Rex"), new Cat("Whiskers"));

        for (AbstractAnimal animal : animals) {
            animal.performDailyRoutine(); // shared template method from the abstract class
            if (animal instanceof Drawable drawable) {
                drawable.draw(); // capability contract from the interface
            }
            System.out.println();
        }
    }
}

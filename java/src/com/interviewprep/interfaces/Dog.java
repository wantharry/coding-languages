package com.interviewprep.interfaces;

/** IS-A Animal (abstract class) AND CAN-DO Drawable (interface) at the same time. */
public class Dog extends AbstractAnimal implements Drawable {
    public Dog(String name) {
        super(name, 50);
    }

    @Override
    public void makeSound() {
        System.out.println(name + " says Woof!");
    }

    @Override
    public void draw() {
        System.out.println("Drawing a dog icon for " + name);
    }
}

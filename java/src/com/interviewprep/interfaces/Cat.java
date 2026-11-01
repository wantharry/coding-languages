package com.interviewprep.interfaces;

public class Cat extends AbstractAnimal implements Drawable {
    public Cat(String name) {
        super(name, 40);
    }

    @Override
    public void makeSound() {
        System.out.println(name + " says Meow!");
    }

    @Override
    public void draw() {
        System.out.println("Drawing a cat icon for " + name);
    }
}

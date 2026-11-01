package com.interviewprep.oop;

/**
 * ABSTRACTION + ENCAPSULATION
 *
 * Shape is an abstract class: it defines WHAT every shape can do (area, perimeter,
 * describe itself) without saying HOW each concrete shape computes those things.
 * That's abstraction -- hiding implementation detail behind a stable contract.
 *
 * The 'color' field is private with a public getter/setter: that's encapsulation --
 * the internal representation is hidden, and callers can only touch it through a
 * controlled interface (so we could add validation later without breaking callers).
 *
 * Shape also provides a *concrete* method, describe(), that is shared by every
 * subclass and calls the abstract methods. This is the Template Method pattern:
 * the algorithm's skeleton lives in the base class, the steps are filled in by
 * subclasses. This is also why Shape is an abstract CLASS and not an interface --
 * it needs to hold state (color) and provide shared, non-trivial behavior, not just
 * a contract. See InterfaceVsAbstractDemo for the interface-vs-abstract-class choice.
 */
public abstract class Shape {

    private String color; // encapsulated: no outside code can reach in and mutate this directly

    protected Shape(String color) {
        this.color = color;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    // Abstract methods: every concrete Shape MUST provide its own formula.
    public abstract double area();

    public abstract double perimeter();

    // Concrete, shared behavior built on top of the abstract contract.
    public String describe() {
        return String.format("%s %s: area=%.2f, perimeter=%.2f",
                color, getClass().getSimpleName(), area(), perimeter());
    }
}

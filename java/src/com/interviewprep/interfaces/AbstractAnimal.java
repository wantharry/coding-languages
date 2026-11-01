package com.interviewprep.interfaces;

/**
 * An ABSTRACT CLASS: used here because Animal subclasses share actual STATE
 * (name, energy) and a chunk of concrete, reusable BEHAVIOR (eat(), the
 * template method performDailyRoutine()) -- not just a method signature.
 *
 * ----------------------------------------------------------------------------
 * INTERFACE vs ABSTRACT CLASS -- the classic senior-interview question:
 *
 * Use an INTERFACE when:
 *   - You're describing a capability/contract ("can be drawn", "is comparable",
 *     "is closeable") that unrelated classes might share.
 *   - You need multiple inheritance of type (a class can implement many
 *     interfaces but extend only one class).
 *   - There's no shared state to carry.
 *
 * Use an ABSTRACT CLASS when:
 *   - Subclasses share actual instance state and/or non-trivial implemented
 *     behavior you don't want every subclass to re-implement (DRY).
 *   - You want to express a strict "IS-A" hierarchy with a common base.
 *   - You want to control constructors / enforce invariants at construction time
 *     (interfaces can't have constructors).
 *
 * In modern Java the line has blurred a little (default/static methods on
 * interfaces), but state + constructors are still the deciding factor.
 * ----------------------------------------------------------------------------
 */
public abstract class AbstractAnimal {
    protected final String name;
    protected int energy;

    protected AbstractAnimal(String name, int startingEnergy) {
        this.name = name;
        this.energy = startingEnergy;
    }

    // Concrete, shared behavior -- every subclass gets this for free.
    public void eat(int amount) {
        energy += amount;
        System.out.println(name + " eats and gains " + amount + " energy (now " + energy + ").");
    }

    // Abstract: each animal makes its own sound.
    public abstract void makeSound();

    // Template method: fixed skeleton, one variable step (makeSound).
    public final void performDailyRoutine() {
        System.out.println(name + " wakes up.");
        makeSound();
        eat(5);
        System.out.println(name + " goes back to sleep.");
    }
}

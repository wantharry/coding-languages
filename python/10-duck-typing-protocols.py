"""
Duck typing and typing.Protocol.

WHY this matters: Python doesn't require a class to declare "I implement
interface X" to be usable anywhere X is expected -- "if it walks like a
duck and quacks like a duck, it's a duck." Polymorphism in Python is based
on an object actually HAVING the right methods/attributes at runtime, not
on any declared relationship between classes. This is fundamentally
different from languages with nominal typing (Java's `implements Foo`),
and interviewers probe it because it explains a huge amount of idiomatic
Python (e.g. why so many stdlib functions accept "anything iterable" or
"anything with a .read() method" without any formal interface existing).

The tradeoff: duck typing gives you zero static checking. If an object is
missing a method you assumed it had, you don't find out until that exact
line runs at runtime. `typing.Protocol` (PEP 544, "structural subtyping")
is Python's answer: it lets you describe a shape ("anything with these
methods/attributes") that a type checker like mypy can verify ahead of
time, WITHOUT requiring classes to inherit from it or declare anything --
the structural check still happens on shape, not declared ancestry. It's
static duck typing.
"""

from typing import Protocol


class Duck:
    def speak(self):
        return "Quack!"

    def move(self):
        return "waddles"


class Dog:
    """Completely unrelated to Duck -- no shared base class, no declared
    interface. Still works anywhere code expects "something with .speak()
    and .move()", because duck typing cares about behavior, not ancestry."""

    def speak(self):
        return "Woof!"

    def move(self):
        return "trots"


class RobotVacuum:
    """Not an animal at all, conceptually. Still slots into the exact same
    polymorphic function below, because it happens to have the same two
    methods -- this is the point: there's no shared lineage required."""

    def speak(self):
        return "Beep boop."

    def move(self):
        return "rolls"


def make_it_perform(thing):
    """No type annotation enforcing anything here is deliberate: this
    function will happily accept ANY object with .speak() and .move(),
    discovered only by actually calling them. This is duck typing's
    polymorphism -- no common base class or interface needed."""
    return f"{thing.__class__.__name__} says '{thing.speak()}' and {thing.move()}."


class NoisyThing:
    """Will fail at runtime -- missing .move() entirely. This is duck
    typing's real cost: nothing catches this until the exact line that
    calls the missing method executes."""

    def speak(self):
        return "???"


def demonstrate_duck_typing():
    print("--- duck typing: unrelated classes, same polymorphic function ---")
    for thing in (Duck(), Dog(), RobotVacuum()):
        print(" ", make_it_perform(thing))

    print(f"\nDuck and Dog share no base class: "
          f"{Duck.__bases__} vs {Dog.__bases__} (both just `object`)")

    print("\n--- the real cost: no static safety net ---")
    try:
        make_it_perform(NoisyThing())
    except AttributeError as exc:
        print(f"  blows up only at runtime, on the exact missing call: {exc}")


class SpeaksAndMoves(Protocol):
    """A structural contract: ANY class with matching methods satisfies
    this Protocol for a type checker's purposes, WITHOUT inheriting from
    it or registering anywhere. Duck, Dog, and RobotVacuum above all
    already satisfy this -- they'd type-check fine passed to a function
    annotated with this Protocol, even though none of them mention it.

    This is "static duck typing": the structural check a type checker like
    mypy performs mirrors exactly what duck typing checks at runtime
    (does the shape match?), just checked ahead of time instead of
    discovered via AttributeError mid-execution.
    """

    def speak(self) -> str: ...
    def move(self) -> str: ...


def make_it_perform_typed(thing: SpeaksAndMoves) -> str:
    """Functionally identical to make_it_perform -- this still runs via
    ordinary duck typing at runtime, Protocol adds nothing to runtime
    behavior. The only difference is a type checker can now verify, BEFORE
    running anything, that whatever's passed here has a compatible shape
    -- catching the NoisyThing mistake above at analysis time instead of
    at a crash."""
    return f"{thing.__class__.__name__} says '{thing.speak()}' and {thing.move()}."


def demonstrate_protocol():
    print("\n--- typing.Protocol: the same duck typing, now statically checkable ---")
    print("Duck, Dog, RobotVacuum each satisfy SpeaksAndMoves structurally, with")
    print("NO inheritance from it and no registration -- confirmed by actually")
    print("calling the Protocol-annotated function with each:")
    for thing in (Duck(), Dog(), RobotVacuum()):
        print(" ", make_it_perform_typed(thing))

    print(
        "\nA type checker (mypy/pyright) run over this file would flag "
        "`make_it_perform_typed(NoisyThing())` as a static error -- missing "
        "`.move()` -- BEFORE the program ever runs. At runtime, Python itself "
        "performs no such check: Protocol is purely a static-analysis "
        "annotation, it has no runtime enforcement effect by default here."
    )


if __name__ == "__main__":
    demonstrate_duck_typing()
    demonstrate_protocol()

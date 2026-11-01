"""
OOP: classes, __init__, inheritance, super(), and dunder methods.

WHY this matters: Python's OOP model is built almost entirely on "dunder"
(double-underscore) methods -- `len(x)` calls `x.__len__()`, `x == y` calls
`x.__eq__(y)`, `repr(x)` calls `x.__repr__()`, and so on. Understanding this
is what separates "I can write a class" from "I understand how Python's
object model actually dispatches operators and built-in functions to your
code" -- which is exactly what lets you make custom objects behave like
built-in ones.

This file builds a small but real inheritance hierarchy (Vehicle ->
ElectricCar) and a value-type class (Money) that meaningfully implements
several dunders.
"""

from functools import total_ordering


class Vehicle:
    """Base class. `__init__` sets up instance state; this is Python's
    constructor-adjacent method (the actual object is already created by
    `__new__` before `__init__` runs -- `__init__` only initializes it)."""

    def __init__(self, make, model, battery_kwh=None):
        self.make = make
        self.model = model
        self.battery_kwh = battery_kwh

    def describe(self):
        return f"{self.make} {self.model}"

    def __repr__(self):
        """__repr__ should be unambiguous, ideally something that could
        recreate the object -- it's what you see in a REPL, a debugger, or
        inside a list/dict's own repr. This is the FALLBACK used by
        `print()`/`str()` too, if __str__ isn't defined separately."""
        return f"Vehicle(make={self.make!r}, model={self.model!r})"


class ElectricCar(Vehicle):
    """Inherits from Vehicle. Demonstrates `super()` to extend (not
    replace) the parent's __init__ and describe()."""

    def __init__(self, make, model, battery_kwh, range_miles):
        # super().__init__(...) calls Vehicle.__init__ so Vehicle's setup
        # logic runs exactly once and isn't duplicated here. Critical once
        # a hierarchy has more than one level, or Vehicle.__init__ changes.
        super().__init__(make, model, battery_kwh=battery_kwh)
        self.range_miles = range_miles

    def describe(self):
        # Extend the parent's behavior rather than fully reimplementing it.
        base_description = super().describe()
        return f"{base_description} (EV, {self.range_miles} mi range)"

    def __repr__(self):
        return (f"ElectricCar(make={self.make!r}, model={self.model!r}, "
                f"battery_kwh={self.battery_kwh}, range_miles={self.range_miles})")


@total_ordering
class Money:
    """A realistic value type implementing several dunders meaningfully:
    __repr__ (debug display), __eq__ (value equality, not identity),
    __len__ (an intentionally unusual but legal use -- number of whole
    currency units, to show __len__ isn't just for containers), __add__
    (operator overloading), and __hash__ (required if you define __eq__ and
    still want instances usable in a set/dict key -- Python sets a class's
    __hash__ to None automatically if you define __eq__ without it,
    making instances unhashable).

    @total_ordering fills in <, <=, >, >= automatically from just __eq__
    and __lt__ -- another dunder-based mechanism worth knowing about.
    """

    def __init__(self, cents, currency="USD"):
        self.cents = cents
        self.currency = currency

    def __repr__(self):
        return f"Money({self.cents}, {self.currency!r})"

    def __str__(self):
        """__str__ is for human-readable display (what print() prefers
        over __repr__ if both are defined). Separate from __repr__ because
        'unambiguous for debugging' and 'nice for end users' are different
        goals."""
        return f"${self.cents / 100:.2f} {self.currency}"

    def __eq__(self, other):
        if not isinstance(other, Money):
            return NotImplemented
        return self.cents == other.cents and self.currency == other.currency

    def __lt__(self, other):
        if not isinstance(other, Money) or self.currency != other.currency:
            return NotImplemented
        return self.cents < other.cents

    def __hash__(self):
        return hash((self.cents, self.currency))

    def __len__(self):
        """Unusual, but legal: number of whole currency units. Included to
        make the point explicit that __len__ is just "whatever len()
        should return for this type" -- there's no enforced semantic tie
        to "number of elements in a container"."""
        return abs(self.cents) // 100

    def __add__(self, other):
        if not isinstance(other, Money) or self.currency != other.currency:
            return NotImplemented
        return Money(self.cents + other.cents, self.currency)


def demonstrate_inheritance_and_super():
    print("--- inheritance + super() ---")
    car = Vehicle("Toyota", "Corolla")
    tesla = ElectricCar("Tesla", "Model 3", battery_kwh=75, range_miles=272)

    print(f"car.describe()   -> {car.describe()!r}")
    print(f"tesla.describe() -> {tesla.describe()!r}  (extends Vehicle.describe via super())")
    print(f"isinstance(tesla, Vehicle) -> {isinstance(tesla, Vehicle)}")
    print(f"repr(car)   -> {car!r}")
    print(f"repr(tesla) -> {tesla!r}\n")


def demonstrate_dunders():
    print("--- __repr__, __str__, __eq__, __len__, __add__, __hash__, ordering ---")
    price_a = Money(1050, "USD")   # $10.50
    price_b = Money(1050, "USD")   # a different object, same value
    price_c = Money(2599, "USD")   # $25.99

    print(f"repr(price_a) -> {price_a!r}")
    print(f"str(price_a)  -> {price_a!s}")
    print(f"price_a == price_b -> {price_a == price_b} "
          f"(value equality via __eq__, even though price_a is price_b -> {price_a is price_b})")
    print(f"len(price_c) -> {len(price_c)}  (__len__: whole dollars, an unusual but legal use)")

    total = price_a + price_c
    print(f"price_a + price_c -> {total!r} via __add__")

    print(f"price_a < price_c -> {price_a < price_c}  (__lt__)")
    print(f"price_a <= price_b -> {price_a <= price_b}  "
          "(>= / <= / > filled in automatically by @total_ordering)")

    money_set = {price_a, price_b, price_c}
    print(f"{{price_a, price_b, price_c}} has {len(money_set)} elements "
          "(price_a and price_b collapse to one, because __eq__ AND __hash__ "
          "both agree they're equal)")


if __name__ == "__main__":
    demonstrate_inheritance_and_super()
    demonstrate_dunders()

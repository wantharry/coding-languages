"""
Generators and `yield` vs returning a list.

WHY this matters: a function with a `return` builds its ENTIRE result in
memory before handing it back. A function with `yield` is a generator
function -- calling it doesn't run the body at all, it just returns a
generator object (an iterator) that runs the body incrementally, one
`yield` at a time, each time something asks it for the next value (via
`next()` or a `for` loop). This is "lazy evaluation": work and memory are
spent only as values are actually consumed, and can stop early for free.

This matters for real interview scenarios: processing a huge file, an
infinite stream, or a pipeline where the consumer might stop after the
first few results -- a list-building approach pays the full memory/CPU
cost up front regardless.
"""

import sys


def build_list_of_squares(n):
    """Eager: computes and stores ALL n squares before returning anything."""
    return [i * i for i in range(n)]


def generate_squares(n):
    """Lazy: a generator function. Calling generate_squares(n) does NOT run
    this body yet -- it returns a generator object immediately. The body
    only executes up to the next `yield` each time a value is pulled."""
    for i in range(n):
        yield i * i


def first_match_eager(n, predicate):
    """Realistic 'stop early' scenario, eager version: must build the WHOLE
    list of squares before it can even start looking for a match."""
    squares = build_list_of_squares(n)
    for value in squares:
        if predicate(value):
            return value
    return None


def first_match_lazy(n, predicate):
    """Same scenario, lazy version: stops consuming the generator the
    moment a match is found. Squares beyond that point are never computed."""
    for value in generate_squares(n):
        if predicate(value):
            return value
    return None


def flatten_eager(nested):
    """Eager flatten: builds one big list up front."""
    result = []
    for sub in nested:
        for item in sub:
            result.append(item)
    return result


def flatten_lazy(nested):
    """Lazy flatten using `yield from`: delegates iteration to each inner
    iterable in turn, without materializing an intermediate list. `yield
    from sub` is shorthand for `for item in sub: yield item`, but also
    correctly forwards sent values/exceptions/return value for sub-generators
    (not needed here, but it's why `yield from` exists rather than just the
    `for` loop)."""
    for sub in nested:
        yield from sub


def countdown_then_done():
    """Generators can have a meaningful return value too -- it becomes the
    `StopIteration.value`, which `yield from` (in a delegating generator)
    can capture. Mostly seen in coroutine-style generator usage."""
    yield 3
    yield 2
    yield 1
    return "liftoff"


def demonstrate_memory_difference():
    print("--- memory: eager list vs lazy generator, same conceptual range ---")
    n = 1_000_000

    eager_list = build_list_of_squares(n)
    lazy_gen = generate_squares(n)

    eager_size = sys.getsizeof(eager_list)
    lazy_size = sys.getsizeof(lazy_gen)

    print(f"sys.getsizeof(list of {n:,} squares)   = {eager_size:,} bytes")
    print(f"sys.getsizeof(generator object)        = {lazy_size:,} bytes")
    print(
        "The generator object itself is a small, fixed-size frame "
        "regardless of n -- it hasn't computed or stored a single square "
        "yet. The list already holds all one million ints."
    )
    ratio = eager_size / lazy_size
    print(f"The list is ~{ratio:,.0f}x larger in memory than the generator object.\n")


def demonstrate_laziness_with_early_exit():
    print("--- laziness: stopping early never pays for the unused tail ---")
    n = 10_000_000

    call_count = {"eager": 0, "lazy": 0}

    def is_big_eager(x):
        call_count["eager"] += 1
        return x > 100

    def is_big_lazy(x):
        call_count["lazy"] += 1
        return x > 100

    result_eager = first_match_eager(n, is_big_eager)
    result_lazy = first_match_lazy(n, is_big_lazy)

    print(f"first_match_eager found {result_eager}, but had already built all "
          f"{n:,} squares before even checking the first one (predicate "
          f"called {call_count['eager']} times, but the list of {n:,} "
          f"existed regardless of that).")
    print(f"first_match_lazy found {result_lazy}, and only pulled "
          f"{call_count['lazy']} values out of the generator before "
          f"stopping -- the remaining {n - call_count['lazy']:,} squares "
          f"were never computed.\n")


def demonstrate_yield_from():
    print("--- yield from: flattening without an intermediate list ---")
    nested = [[1, 2, 3], [4, 5], [6]]
    print(f"flatten_eager(nested)                 -> {flatten_eager(nested)}")
    print(f"list(flatten_lazy(nested))            -> {list(flatten_lazy(nested))}")

    print("\n--- generator return value, visible via manual next()/StopIteration ---")
    gen = countdown_then_done()
    values = []
    try:
        while True:
            values.append(next(gen))
    except StopIteration as stop:
        final_return_value = stop.value
    print(f"yielded values: {values}")
    print(f"StopIteration.value (the generator's `return`): {final_return_value!r}")


if __name__ == "__main__":
    demonstrate_memory_difference()
    demonstrate_laziness_with_early_exit()
    demonstrate_yield_from()

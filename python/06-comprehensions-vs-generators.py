"""
List/dict/set comprehensions vs generator expressions.

WHY this matters: all four comprehension forms share the same syntax shape
`EXPR for ITEM in ITERABLE [if COND]`, but list/dict/set comprehensions are
EAGER -- they build the entire collection in memory immediately -- while a
generator expression `(EXPR for ITEM in ITERABLE)` is LAZY, producing values
one at a time, on demand, exactly like the generator FUNCTIONS in
03-generators-and-yield.py (a generator expression is just generator-function
behavior without needing to name and define a separate function).

The only syntactic difference between a list comprehension and a generator
expression is square brackets `[...]` vs parentheses `(...)` -- which is
exactly why this distinction trips people up, and exactly why interviewers
like asking about it.
"""

import sys


def demonstrate_syntax_forms():
    print("--- the four comprehension/generator forms, same source data ---")
    numbers = range(10)

    list_comp = [n * n for n in numbers if n % 2 == 0]
    set_comp = {n % 3 for n in numbers}
    dict_comp = {n: n * n for n in numbers if n % 2 == 0}
    gen_expr = (n * n for n in numbers if n % 2 == 0)

    print(f"list comprehension   [n*n for n in range(10) if n%2==0] -> {list_comp}")
    print(f"set comprehension    {{n%3 for n in range(10)}}          -> {set_comp}")
    print(f"dict comprehension   {{n:n*n for n in range(10) if even}} -> {dict_comp}")
    print(f"generator expression (n*n for n in range(10) if n%2==0) -> {gen_expr}")
    print("Note the generator expression prints as a <generator object>, not "
          "values -- nothing has been computed yet. Consuming it:")
    print(f"list(gen_expr) -> {list(gen_expr)}\n")


def demonstrate_memory_difference():
    print("--- memory: eager comprehension vs lazy generator expression ---")
    n = 1_000_000

    eager = [i for i in range(n)]
    lazy = (i for i in range(n))

    eager_bytes = sys.getsizeof(eager)
    lazy_bytes = sys.getsizeof(lazy)

    print(f"sys.getsizeof([i for i in range(n)]), n={n:,} -> {eager_bytes:,} bytes")
    print(f"sys.getsizeof((i for i in range(n))), n={n:,} -> {lazy_bytes:,} bytes")
    print(
        f"The list comprehension materializes all {n:,} ints up front. The "
        "generator expression is a small fixed-size object regardless of n "
        "-- it holds only its current position and the recipe to produce "
        "the next value, computed on demand."
    )
    print(f"The list is ~{eager_bytes / lazy_bytes:,.0f}x larger in memory.\n")


def demonstrate_laziness_is_real_not_just_smaller():
    """Memory size alone doesn't prove laziness -- a generator could in
    theory precompute everything into a hidden buffer. This proves it
    doesn't: side effects inside the generator expression only happen as
    each value is actually pulled."""
    print("--- proving the generator expression computes on demand, not up front ---")

    computed = []

    def track(x):
        computed.append(x)
        return x * x

    gen = (track(i) for i in range(5))
    print(f"created generator expression -- computed so far: {computed} (nothing yet)")

    first_value = next(gen)
    print(f"next(gen) -> {first_value}; computed so far: {computed} (only index 0 ran)")

    second_value = next(gen)
    print(f"next(gen) -> {second_value}; computed so far: {computed} (only up to index 1 ran)")

    remaining = list(gen)
    print(f"list(gen) drains the rest -> {remaining}; computed so far: {computed}\n")


def demonstrate_one_shot_vs_reusable():
    """A real practical consequence of laziness: a generator expression is
    exhausted after one full iteration. A list comprehension is a plain
    list and can be iterated as many times as you like."""
    print("--- practical consequence: generators are one-shot, lists are reusable ---")
    squares_list = [i * i for i in range(5)]
    squares_gen = (i * i for i in range(5))

    print(f"first pass over list -> {list(squares_list)}")
    print(f"second pass over list -> {list(squares_list)} (still works)")

    print(f"first pass over generator -> {list(squares_gen)}")
    print(f"second pass over same generator -> {list(squares_gen)} "
          "(empty! already exhausted)")


if __name__ == "__main__":
    demonstrate_syntax_forms()
    demonstrate_memory_difference()
    demonstrate_laziness_is_real_not_just_smaller()
    demonstrate_one_shot_vs_reusable()

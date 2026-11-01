"""
`is` vs `==`, and the small-int/string interning gotcha.

WHY this matters: `==` calls `__eq__` and asks "are these two objects
EQUAL in value?". `is` asks "are these two names bound to the EXACT SAME
object in memory?" (equivalent to comparing `id(a) == id(b)`). They answer
different questions, and conflating them is a real, common bug source --
made worse because CPython has an internal optimization (caching small
integers, and interning certain strings) that makes `is` *appear* to work
like `==` in casual testing, right up until it doesn't.

This file does NOT guess at the exact caching rules -- it runs real checks
and reports the real, observed result, because the precise boundaries are
implementation details of CPython (not guaranteed by the language spec,
and genuinely surprising).
"""


def demonstrate_is_vs_equals_basics():
    print("--- `==` (value equality) vs `is` (identity) on freshly built objects ---")
    list_a = [1, 2, 3]
    list_b = [1, 2, 3]
    print(f"list_a = {list_a}, list_b = {list_b}")
    print(f"list_a == list_b -> {list_a == list_b}  (same VALUES)")
    print(f"list_a is list_b -> {list_a is list_b}  (two DIFFERENT list objects)\n")


def demonstrate_small_int_caching():
    print("--- CPython's small-integer cache: real, observed boundaries ---")
    print(
        "CPython pre-creates and caches integer objects for a fixed range "
        "(implementation detail, not a language guarantee) and reuses them "
        "whenever that value is needed, instead of allocating a new int "
        "object each time."
    )

    # Build each value via a non-literal path (a function call doing
    # arithmetic) so the interpreter can't fold it into a shared constant
    # at compile time -- this tests the runtime int cache for real, not
    # compiler constant-folding.
    def make(n):
        return 0 + n

    for value in (5, 100, 256, 257, 1000, -5, -6):
        a = make(value)
        b = make(value)
        print(f"  value={value:>5}: a is b -> {a is b}")

    print(
        "\nObserved pattern (see the real booleans above, not a guessed "
        "rule): small ints share identity because they come from "
        "CPython's cached range; once the value falls outside that cached "
        "range, two independently-computed ints with the same value are "
        "separate objects, and `is` correctly returns False -- `==` still "
        "returns True for all of them, because the VALUES are still equal "
        "either way.\n"
    )


def demonstrate_string_interning():
    print("--- string interning: real, observed behavior, not a blanket rule ---")

    # Literal, identifier-shaped strings: CPython interns these fairly
    # aggressively (they look like something that could be a variable
    # name), especially as compile-time constants in the same code object.
    literal_a = "hello"
    literal_b = "hello"
    print(f'literal_a = "hello"; literal_b = "hello"')
    print(f"literal_a is literal_b -> {literal_a is literal_b}")

    # A string built at RUNTIME by concatenation is a fresh object; even
    # if its value matches a literal elsewhere, nothing automatically
    # interns or deduplicates it against that literal.
    built_at_runtime = "".join(["h", "e", "l", "l", "o"])
    print(f'built_at_runtime = "".join(["h","e","l","l","o"])  (value is "hello")')
    print(f"built_at_runtime == literal_a -> {built_at_runtime == literal_a}  (same value)")
    print(f"built_at_runtime is literal_a -> {built_at_runtime is literal_a}  "
          "(NOT automatically interned just for matching a literal elsewhere)")

    # A string containing a space or other non-identifier-shaped content
    # is a case CPython is much less likely to intern as a literal.
    spaced_a = "hello world"
    spaced_b = "hello world"
    print(f'\nspaced_a = "hello world"; spaced_b = "hello world"')
    print(f"spaced_a is spaced_b -> {spaced_a is spaced_b} "
          "(observed result for THIS interpreter/version -- not something "
          "to rely on in real code either way)")

    print(
        "\nThe takeaway interviewers actually want: never rely on `is` for "
        "value comparison of ints or strings, even though it often "
        "'happens to work' for small ints and simple literals in casual "
        "testing. Use `==`. Reserve `is` for what it's actually for: "
        "checking against singletons like `None`/`True`/`False`, which "
        "ARE guaranteed to be singletons by the language itself (`is None` "
        "is the idiomatic, PEP 8-mandated way to check for None, precisely "
        "BECAUSE identity is guaranteed there, unlike for ints/strings).\n"
    )


def demonstrate_the_idiomatic_use_of_is():
    print("--- where `is` is actually the RIGHT tool: None/True/False singletons ---")
    value = None
    print(f"value = None")
    print(f"value is None -> {value is None}  (idiomatic, guaranteed correct)")
    print(f"value == None -> {value == None}  (works here too, but discouraged by "
          "PEP 8 -- a custom __eq__ could lie about equality to None in a way "
          "it never could lie about identity)")


if __name__ == "__main__":
    demonstrate_is_vs_equals_basics()
    demonstrate_small_int_caching()
    demonstrate_string_interning()
    demonstrate_the_idiomatic_use_of_is()

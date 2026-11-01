"""
Mutable default arguments: the single most notorious Python gotcha.

WHY this matters in an interview: it's not a syntax quirk, it's a direct
consequence of how Python evaluates `def`. A default argument expression is
evaluated EXACTLY ONCE, at function *definition* time (when the `def`
statement runs), not once per call. The resulting object is bound to the
function itself and reused on every call that doesn't supply that argument.

If the default is an immutable object (int, str, tuple, None, ...), you'd
never notice this, because nothing can mutate it in place anyway. But if the
default is a mutable object (list, dict, set, or any custom mutable object),
every call that relies on the default is secretly sharing --- and can
mutate --- the SAME object. That's the bug.
"""


def broken_append(x, lst=[]):
    """THE BUG: `lst` defaults to one list object, created once, when this
    function was defined. Every call that omits `lst` appends to that same
    list, which never gets garbage collected because the function object
    itself still holds a reference to it."""
    lst.append(x)
    return lst


def fixed_append(x, lst=None):
    """THE FIX: default to the immutable sentinel `None`, and create a fresh
    mutable object *inside* the function body, which runs anew on every
    call."""
    if lst is None:
        lst = []
    lst.append(x)
    return lst


def demonstrate_the_bug():
    print("--- broken_append: calls with no `lst` argument share state ---")
    first_call = broken_append(1)
    print(f"broken_append(1)                -> {first_call}")

    second_call = broken_append(2)
    print(f"broken_append(2)                -> {second_call}")
    # Notice: second_call contains BOTH 1 and 2, even though we never passed
    # [1] in. first_call and second_call are literally the same list object.
    print(f"first_call is second_call?      -> {first_call is second_call}")

    third_call = broken_append(3)
    print(f"broken_append(3)                -> {third_call}")
    print(
        "Expected naive behaviour would be [3] each time (a fresh list per "
        "call, mirroring most other languages' semantics) --- instead the "
        "list keeps growing across unrelated calls.\n"
    )


def demonstrate_the_fix():
    print("--- fixed_append: each call with no `lst` gets its own fresh list ---")
    first_call = fixed_append(1)
    print(f"fixed_append(1)                 -> {first_call}")

    second_call = fixed_append(2)
    print(f"fixed_append(2)                 -> {second_call}")
    print(f"first_call is second_call?      -> {first_call is second_call}")

    third_call = fixed_append(3)
    print(f"fixed_append(3)                 -> {third_call}")
    print("Each call is independent, as expected.\n")


def demonstrate_defaults_are_bound_to_the_function_object():
    """Proof that the default argument lives on the function object itself,
    not somewhere re-created per call."""
    print("--- proof: the default list lives in broken_append.__defaults__ ---")
    print(f"broken_append.__defaults__ before any call -> (created at def time)")
    # Reset by re-defining is not needed; just inspect current state.
    print(f"broken_append.__defaults__ now              -> {broken_append.__defaults__}")
    print(
        "That tuple holds the very list object every no-arg call has been "
        "mutating. This is also why, when you DO pass your own list "
        "explicitly, the bug disappears -- you're no longer touching the "
        "shared default at all:"
    )
    my_own_list = []
    broken_append(99, my_own_list)
    print(f"broken_append(99, my_own_list) -> {my_own_list} (unaffected by prior calls)")


if __name__ == "__main__":
    demonstrate_the_bug()
    demonstrate_the_fix()
    demonstrate_defaults_are_bound_to_the_function_object()

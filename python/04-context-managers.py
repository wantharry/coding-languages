"""
Context managers: the `with` statement, and two ways to build your own.

WHY this matters: `with EXPR as NAME: BODY` is sugar for a try/finally that
is guaranteed to call cleanup -- on normal exit, early `return`, AND when the
body raises. That exception-safety is the entire point: it's the same
guarantee `finally` gives you, but packaged so the cleanup logic lives next
to the resource-acquisition logic instead of being duplicated at every call
site.

Desugaring (roughly) of:

    with EXPR as NAME:
        BODY

is:

    mgr = EXPR
    NAME = mgr.__enter__()
    try:
        BODY
    finally:
        mgr.__exit__(exc_type, exc_value, traceback)   # args are None,None,None
                                                         # if BODY didn't raise

If `__exit__` returns a truthy value, the exception (if any) is SWALLOWED --
this is a sharp edge worth knowing: it's why almost every real `__exit__`
explicitly returns `False`/`None`.

Two ways to implement the protocol:
1. A class with `__enter__`/`__exit__` (full control, can hold state).
2. `@contextlib.contextmanager` on a generator function (less boilerplate
   for the common case of "setup, yield once, teardown").
"""

from contextlib import contextmanager


class ManagedResource:
    """Class-based context manager. `__enter__` acquires/returns the
    resource; `__exit__` always runs cleanup, and receives exception info
    if the body raised."""

    def __init__(self, name):
        self.name = name
        self.is_open = False

    def __enter__(self):
        self.is_open = True
        print(f"  [ManagedResource] acquiring '{self.name}'")
        return self  # this becomes the `as NAME` value

    def __exit__(self, exc_type, exc_value, traceback):
        self.is_open = False
        print(f"  [ManagedResource] releasing '{self.name}' "
              f"(exc_type={exc_type.__name__ if exc_type else None})")
        # Returning False/None (the default) means: do NOT suppress the
        # exception -- let it propagate normally after cleanup runs.
        return False

    def do_work(self):
        if not self.is_open:
            raise RuntimeError("resource not open")
        print(f"  [ManagedResource] working with '{self.name}'")


@contextmanager
def managed_resource_generator(name):
    """Generator-based context manager. Everything before `yield` is
    __enter__; the yielded value is the `as NAME` value; everything after
    `yield` is __exit__ -- and critically, code after `yield` must be
    wrapped in try/finally if you want it to run on exception, same as any
    generator's cleanup."""
    print(f"  [generator-based] acquiring '{name}'")
    try:
        yield name
    finally:
        print(f"  [generator-based] releasing '{name}'")


def demonstrate_normal_use():
    print("--- class-based context manager, normal (non-raising) use ---")
    with ManagedResource("db-connection") as resource:
        resource.do_work()
    print(f"after `with` block, is_open = {resource.is_open}\n")


def demonstrate_exception_safety_class_based():
    print("--- class-based context manager: cleanup runs even when body raises ---")
    resource_ref = ManagedResource("file-handle")
    try:
        with resource_ref as resource:
            resource.do_work()
            raise ValueError("something went wrong inside the with-block")
    except ValueError as exc:
        print(f"  caught outside the `with`: {exc!r}")
    print(f"after the raise, is_open = {resource_ref.is_open} "
          f"(False -- __exit__ ran despite the exception)\n")


def demonstrate_exception_safety_generator_based():
    print("--- @contextmanager-based context manager: same guarantee ---")
    try:
        with managed_resource_generator("socket") as name:
            print(f"  using {name}")
            raise RuntimeError("boom")
    except RuntimeError as exc:
        print(f"  caught outside the `with`: {exc!r}")
    print("the 'releasing' line above printed even though RuntimeError was raised --\n"
          "that's only true because teardown is in a `finally` inside the generator.\n")


def demonstrate_suppressing_exceptions():
    """Shows the sharp edge: __exit__ returning True swallows the
    exception entirely. Rarely what you want, but exactly how
    contextlib.suppress is implemented, so it's worth seeing explicitly."""

    class SwallowsEverything:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_value, traceback):
            if exc_type is not None:
                print(f"  [SwallowsEverything] suppressing {exc_type.__name__}: {exc_value}")
            return True  # <-- truthy return suppresses the exception

    print("--- __exit__ returning True suppresses the exception entirely ---")
    with SwallowsEverything():
        raise KeyError("this never reaches outside the with-block")
    print("execution continues here normally -- the KeyError never propagated.\n")


if __name__ == "__main__":
    demonstrate_normal_use()
    demonstrate_exception_safety_class_based()
    demonstrate_exception_safety_generator_based()
    demonstrate_suppressing_exceptions()

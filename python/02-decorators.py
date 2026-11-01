"""
Decorators, written from scratch.

WHY this matters: interviewers ask about decorators constantly because they
probe whether you understand that functions are first-class objects in
Python, and that `@decorator` is pure syntactic sugar for reassignment --
nothing magic happens at the language level.

    @decorator
    def func():
        ...

desugars EXACTLY to:

    def func():
        ...
    func = decorator(func)

That's it. `decorator` is just a callable that receives the original
function and returns *something* (usually a replacement function) which gets
bound to the original name.

This file builds two real decorators: a timing decorator and a retry
decorator (a decorator *factory*, since it takes its own arguments).
"""

import functools
import time


def timer(func):
    """A decorator that times how long `func` takes to run.

    `functools.wraps` matters here for a concrete reason, not cosmetics:
    without it, `wrapper.__name__`, `wrapper.__doc__`, and `wrapper.__wrapped__`
    would all report as the *wrapper's* metadata, not the original function's.
    That breaks introspection tools, debuggers, and anything that inspects
    `func.__name__` (logging, API routers, test discovery, etc).
    """

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"  [timer] {func.__name__}() took {elapsed * 1000:.3f} ms")
        return result

    return wrapper


def retry(times=3, exceptions=(Exception,)):
    """A decorator FACTORY: `retry(3)` is a function call that returns the
    actual decorator. This is why it needs an extra layer of nesting versus
    `timer` above: `@retry(3)` desugars to

        def flaky():
            ...
        flaky = retry(3)(flaky)

    `retry(3)` runs first and returns the real decorator; THAT decorator is
    then applied to `flaky`.
    """

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as exc:
                    last_exception = exc
                    print(f"  [retry] attempt {attempt}/{times} failed: {exc!r}")
            raise last_exception

        return wrapper

    return decorator


@timer
def slow_sum(n):
    """Deliberately does real, measurable work so the timer has something
    non-zero to report."""
    return sum(range(n))


# Manual equivalent of `@timer` above, to prove the desugaring claim:
def slow_sum_manual(n):
    return sum(range(n))


slow_sum_manual = timer(slow_sum_manual)


_attempt_counter = {"n": 0}


@retry(times=3, exceptions=(ValueError,))
def flaky_operation():
    """Fails the first two times it's called, then succeeds on the third --
    a realistic stand-in for a network call that intermittently fails."""
    _attempt_counter["n"] += 1
    if _attempt_counter["n"] < 3:
        raise ValueError(f"simulated transient failure #{_attempt_counter['n']}")
    return "success"


if __name__ == "__main__":
    print("--- @timer on slow_sum ---")
    result = slow_sum(2_000_000)
    print(f"slow_sum(2_000_000) = {result}")

    print("\n--- proving @decorator is just `func = decorator(func)` ---")
    print(f"slow_sum.__name__        -> {slow_sum.__name__!r} (preserved by functools.wraps)")
    print(f"slow_sum_manual.__name__ -> {slow_sum_manual.__name__!r} (same, built manually)")
    print(f"slow_sum.__wrapped__ is the original undecorated function: {slow_sum.__wrapped__}")

    print("\n--- @retry(times=3) on a function that fails twice then succeeds ---")
    outcome = flaky_operation()
    print(f"flaky_operation() -> {outcome!r}")

    print("\n--- what __name__ would look like WITHOUT functools.wraps ---")

    def timer_no_wraps(func):
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)

        return wrapper

    @timer_no_wraps
    def example():
        pass

    print(f"example.__name__ -> {example.__name__!r} (lost! reports 'wrapper', not 'example')")

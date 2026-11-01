"""
*args and **kwargs.

WHY this matters: interviewers want to know you understand these aren't two
features bolted together -- they're both about Python unpacking a call's
remaining positional / keyword arguments into collections inside the
function, AND (with the matching `*`/`**` at a CALL site) unpacking
collections back out into individual arguments. Same mechanism, two
directions.

- `*args` inside a function signature collects extra positional arguments
  into a tuple.
- `**kwargs` inside a function signature collects extra keyword arguments
  into a dict.
- `*seq` / `**mapping` at a CALL site does the reverse: spreads a sequence
  into positional arguments / a mapping into keyword arguments.
"""


def sum_all(*args):
    """Accepts any number of positional arguments. `args` is a tuple."""
    print(f"  args received as: {args!r} (type: {type(args).__name__})")
    return sum(args)


def describe_person(**kwargs):
    """Accepts any number of keyword arguments. `kwargs` is a dict."""
    print(f"  kwargs received as: {kwargs!r} (type: {type(kwargs).__name__})")
    return ", ".join(f"{key}={value}" for key, value in kwargs.items())


def flexible_call(required, *args, **kwargs):
    """Combining a required positional parameter with both *args and
    **kwargs. Order matters: required/positional-with-defaults, then
    *args, then keyword-only-with-defaults, then **kwargs -- this is
    enforced by the language, not a convention."""
    print(f"  required = {required!r}")
    print(f"  args     = {args!r}")
    print(f"  kwargs   = {kwargs!r}")


def forward_everything(func, *args, **kwargs):
    """The real-world use case: a wrapper/decorator-style function that
    doesn't know or care what `func` takes -- it just forwards whatever it
    received. This exact pattern is what makes generic decorators (see
    02-decorators.py) possible without them needing to know each wrapped
    function's signature."""
    print(f"  forwarding to {func.__name__}(*{args!r}, **{kwargs!r})")
    return func(*args, **kwargs)


def demonstrate_args():
    print("--- *args: collecting positional arguments into a tuple ---")
    total = sum_all(1, 2, 3, 4)
    print(f"sum_all(1, 2, 3, 4) -> {total}\n")


def demonstrate_kwargs():
    print("--- **kwargs: collecting keyword arguments into a dict ---")
    description = describe_person(name="Ada", role="engineer", seniority="senior")
    print(f"describe_person(...) -> {description!r}\n")


def demonstrate_combined():
    print("--- combining required + *args + **kwargs ---")
    flexible_call("must-have", 1, 2, 3, debug=True, retries=5)
    print()


def demonstrate_unpacking_at_call_site():
    """The reverse direction: `*` and `**` at a CALL site spread an
    existing collection out into separate arguments."""
    print("--- unpacking collections back into a call with * and ** ---")
    numbers = [10, 20, 30]
    print(f"sum_all(*{numbers}) unpacks the list into 3 positional args:")
    sum_all(*numbers)

    person_fields = {"name": "Grace", "role": "architect"}
    print(f"describe_person(**{person_fields}) unpacks the dict into kwargs:")
    describe_person(**person_fields)
    print()


def demonstrate_generic_forwarding():
    print("--- *args/**kwargs enabling a function to forward to ANY callable ---")

    def add(a, b):
        return a + b

    def greet(greeting, *, name):
        return f"{greeting}, {name}!"

    result_add = forward_everything(add, 3, 4)
    print(f"-> {result_add}")
    result_greet = forward_everything(greet, "Hello", name="World")
    print(f"-> {result_greet}")


if __name__ == "__main__":
    demonstrate_args()
    demonstrate_kwargs()
    demonstrate_combined()
    demonstrate_unpacking_at_call_site()
    demonstrate_generic_forwarding()

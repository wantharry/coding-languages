"""
Exception handling: try/except/else/finally, custom exceptions, chaining.

WHY this matters: all four clauses have DISTINCT, precise semantics that
interviewers expect you to know exactly, not approximately:

- `try`: the code that might raise.
- `except`: runs only if a matching exception was raised in `try`.
- `else`: runs only if `try` completed WITHOUT raising -- NOT "no except
  matched", genuinely "nothing was raised at all". Its entire reason to
  exist is to distinguish "this succeeded" from "this failed but the
  except handled it and we kept going" -- code that should only run on the
  success path, but that you don't want to accidentally include inside the
  `try` itself (which would have its own exceptions caught by the same
  `except`, muddying what actually failed).
- `finally`: ALWAYS runs -- success, handled exception, unhandled
  exception, even a `return`/`break`/`continue` inside `try` or `except`.
  Used for cleanup that must happen no matter what (this is the same
  guarantee `with` blocks are built on, see 04-context-managers.py).

Custom exceptions: subclass `Exception` (or a more specific built-in) to
create domain-meaningful error types instead of overloading generic ones.

Exception chaining (`raise X from Y`): preserves the ORIGINAL exception as
`X.__cause__` while raising a new, often more meaningful one -- so the
traceback shows both "what ultimately went wrong" and "what originally
triggered it," instead of losing the original context.
"""


class InsufficientFundsError(Exception):
    """A custom, domain-specific exception -- carries exactly the context
    relevant to this failure, instead of raising a generic ValueError that
    callers would have to inspect a string message to understand."""

    def __init__(self, requested, available):
        self.requested = requested
        self.available = available
        super().__init__(
            f"cannot withdraw {requested}, only {available} available"
        )


def divide(a, b):
    return a / b


def demonstrate_all_four_clauses():
    print("--- try/except/else/finally: case 1, no exception raised ---")
    try:
        result = divide(10, 2)
    except ZeroDivisionError:
        print("  except: division by zero")
    else:
        # Runs ONLY because `try` succeeded with no exception.
        print(f"  else: succeeded cleanly, result = {result}")
    finally:
        # Runs regardless of what happened above.
        print("  finally: always runs (cleanup)")

    print("\n--- try/except/else/finally: case 2, exception raised and caught ---")
    try:
        result = divide(10, 0)
    except ZeroDivisionError:
        print("  except: division by zero, handled")
    else:
        # Does NOT run -- try raised, so else is skipped entirely, even
        # though the except below handled it.
        print("  else: this should never print")
    finally:
        print("  finally: always runs (cleanup)")

    print("\n--- finally runs even when try has a `return` (shown via a helper) ---")

    def returns_from_try():
        try:
            return "value from try"
        finally:
            print("  finally: ran even though `try` already hit `return`")

    outcome = returns_from_try()
    print(f"  function still returned: {outcome!r}\n")


class BankAccount:
    def __init__(self, balance):
        self.balance = balance

    def withdraw(self, amount):
        if amount > self.balance:
            raise InsufficientFundsError(requested=amount, available=self.balance)
        self.balance -= amount
        return self.balance


def demonstrate_custom_exception():
    print("--- custom exception carrying structured context ---")
    account = BankAccount(balance=100)
    try:
        account.withdraw(250)
    except InsufficientFundsError as exc:
        print(f"  caught InsufficientFundsError: {exc}")
        print(f"  structured fields -> requested={exc.requested}, available={exc.available}\n")


def load_config(raw_value):
    """Simulates a lower-level parsing failure that should be re-raised as
    a higher-level, more meaningful domain error -- WITHOUT losing the
    original traceback/cause."""
    try:
        return int(raw_value)
    except ValueError as original_error:
        # `raise ... from original_error` sets __cause__ explicitly,
        # preserving the real root cause instead of hiding it.
        raise RuntimeError(
            f"config value {raw_value!r} is not a valid integer"
        ) from original_error


def demonstrate_exception_chaining():
    print("--- exception chaining with `raise X from Y` ---")
    try:
        load_config("not-a-number")
    except RuntimeError as exc:
        print(f"  caught: {exc}")
        print(f"  exc.__cause__ (the ORIGINAL exception, preserved): {exc.__cause__!r}")
        print(
            "  Printing this exception's full traceback would show both: "
            "'ValueError: ...' (the real root cause) AND, chained below it, "
            "'RuntimeError: ...' (the re-raised, more meaningful error) -- "
            "connected by the literal text 'The above exception was the "
            "direct cause of the following exception'."
        )


if __name__ == "__main__":
    demonstrate_all_four_clauses()
    demonstrate_custom_exception()
    demonstrate_exception_chaining()

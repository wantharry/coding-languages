# Python Interview Prep (Core Python / CS Fundamentals)

A plain, standard-library-only Python 3 project for senior-software-engineer
interview prep. Every concept is a small, self-contained, **actually-run**
script under this directory, with comments explaining the *why*, not just
the *what* — the mechanics interviewers probe (mutable defaults, the GIL,
decorators, shallow vs deep copy), not a tour of syntax.

No pip packages, no virtualenv — every file runs with the system
interpreter directly. Built and verified against Python 3.12.3.

## Running things

Every file is standalone and runnable on its own:

```bash
python3 01-mutable-default-arguments.py
python3 02-decorators.py
python3 03-generators-and-yield.py
python3 04-context-managers.py
python3 05-args-kwargs.py
python3 06-comprehensions-vs-generators.py
python3 07-shallow-vs-deep-copy.py
python3 08-gil-threading-vs-multiprocessing.py
python3 09-oop-dunder-methods.py
python3 10-duck-typing-protocols.py
python3 11-exceptions.py
python3 12-is-vs-equals-interning.py
```

## What each file covers

- **`01-mutable-default-arguments.py`** — the classic `def f(x, lst=[])`
  gotcha: a default argument expression is evaluated once, at `def` time,
  not per call, so a mutable default is silently shared and mutated across
  unrelated calls. Shows the bug firing for real, then the `lst=None` fix,
  then proves the shared list lives on `func.__defaults__`.
- **`02-decorators.py`** — a real `timer` decorator and a `retry(times=3)`
  decorator *factory*, both using `functools.wraps`; demonstrates exactly
  what `@decorator` desugars to (`func = decorator(func)`), and what
  breaks (`__name__`, `__wrapped__`) if `functools.wraps` is left out.
- **`03-generators-and-yield.py`** — `yield` vs building a list: a
  generator object's `sys.getsizeof` vs a fully-materialized list of the
  same logical size, an early-exit scenario proving laziness isn't just
  smaller memory but genuinely skipped computation, and `yield from` for
  delegated flattening plus a generator's `return` value via
  `StopIteration.value`.
- **`04-context-managers.py`** — the `with` statement's desugaring to
  `__enter__`/try-finally/`__exit__`; a class-based context manager and a
  `@contextlib.contextmanager` generator-based one; both proven to run
  cleanup even when the body raises; and the sharp edge where `__exit__`
  returning `True` silently suppresses the exception.
- **`05-args-kwargs.py`** — `*args` (tuple) and `**kwargs` (dict) in a
  function signature, combined with a required positional parameter, the
  reverse direction (`*`/`**` unpacking a collection at a call site), and
  the realistic "forward everything to an unknown callable" pattern that
  underlies generic decorators.
- **`06-comprehensions-vs-generators.py`** — all four comprehension forms
  (list/set/dict/generator expression), the memory difference via
  `sys.getsizeof`, a side-effect-tracking proof that a generator expression
  computes on demand rather than up front, and the practical consequence
  that generator expressions are one-shot while lists are reusable.
- **`07-shallow-vs-deep-copy.py`** — plain assignment (no copy at all) vs
  `copy.copy()` (shares nested mutable objects — the real bug, shown
  firing) vs `copy.deepcopy()` (fully independent), on both a
  list-of-lists and a real custom object (`Team` with a `members` list
  attribute).
- **`08-gil-threading-vs-multiprocessing.py`** — an honest explanation of
  what CPython's GIL does and doesn't constrain (CPU-bound vs I/O-bound),
  then a real timed demo: the same CPU-bound pure-Python loop run
  sequentially, across 4 threads, and across 4 processes.
- **`09-oop-dunder-methods.py`** — `__init__`, inheritance, `super()`
  (`Vehicle` → `ElectricCar`), and a `Money` value type meaningfully
  implementing `__repr__`, `__str__`, `__eq__`, `__hash__`, `__len__`,
  `__add__`, and ordering via `@total_ordering`.
- **`10-duck-typing-protocols.py`** — `Duck`/`Dog`/`RobotVacuum`, three
  unrelated classes with no shared base, all working through the same
  polymorphic function purely because they have matching methods; the real
  cost (an `AttributeError` only at the exact missing call); then
  `typing.Protocol` adding a statically-checkable version of the exact same
  structural contract, with no inheritance or runtime behavior change.
- **`11-exceptions.py`** — `try`/`except`/`else`/`finally` with precise,
  distinct semantics for each clause (including `else` only running when
  nothing was raised, and `finally` running even past a `return`); a custom
  `InsufficientFundsError` carrying structured context; and exception
  chaining with `raise X from Y`, preserving `__cause__`.
- **`12-is-vs-equals-interning.py`** — `==` (value equality) vs `is`
  (identity); CPython's small-integer cache and string interning, shown
  with real, observed booleans rather than an assumed rule, plus the
  idiomatic, correct use of `is` for singleton checks (`is None`).

## Verification performed

- Every file was run directly with `python3` (3.12.3) and produced a clean
  exit (`echo $?` → `0`) with no unhandled tracebacks.
- All 12 files additionally pass `python3 -m py_compile` with zero errors.
- The output of each file was read and checked line-by-line against what
  its own comments claim — not assumed from memory.
- The three highest-risk examples (mutable defaults, shallow/deep copy, and
  the GIL/threading-vs-multiprocessing timing demo) were run **multiple
  times** specifically to confirm the behavior is reliably reproducible,
  not a one-off fluke. Real, copied-verbatim output below.

### `01-mutable-default-arguments.py` — verified output

```
--- broken_append: calls with no `lst` argument share state ---
broken_append(1)                -> [1]
broken_append(2)                -> [1, 2]
first_call is second_call?      -> True
broken_append(3)                -> [1, 2, 3]
Expected naive behaviour would be [3] each time (a fresh list per call, mirroring most other languages' semantics) --- instead the list keeps growing across unrelated calls.

--- fixed_append: each call with no `lst` gets its own fresh list ---
fixed_append(1)                 -> [1]
fixed_append(2)                 -> [2]
first_call is second_call?      -> False
fixed_append(3)                 -> [3]
Each call is independent, as expected.
```

The bug is exactly as advertised: `broken_append`'s list keeps accumulating
values across calls that never passed a list in (`first_call is
second_call` → `True` — they're the same object), while `fixed_append`
starts fresh every time (`first_call is second_call` → `False`).

### `07-shallow-vs-deep-copy.py` — verified output

```
--- copy.copy(): the shared-nested-reference bug, for real ---
original = [[1, 2], [3, 4]]
shallow  = [[1, 2], [3, 4]]
original is shallow         -> False (different outer list objects, as expected)
original[0] is shallow[0]   -> True (SAME inner list object -- this is the bug)

Now mutate the inner list only through `shallow`:
original = [[1, 2, 999], [3, 4]]  <- changed too, even though we only touched `shallow`!
shallow  = [[1, 2, 999], [3, 4]]

--- copy.deepcopy(): the fix, fully independent all the way down ---
original = [[1, 2], [3, 4]]
deep     = [[1, 2], [3, 4]]
original[0] is deep[0] -> False (different objects -- deepcopy recursed into the nested list)

Mutating the inner list only through `deep`:
original = [[1, 2], [3, 4]]  <- unaffected, exactly as expected
deep     = [[1, 2, 999], [3, 4]]
```

`copy.copy()` really does share the nested list by reference (mutating it
through `shallow` leaks into `original`); `copy.deepcopy()` really is fully
independent (the same mutation through `deep` leaves `original` untouched).

### `08-gil-threading-vs-multiprocessing.py` — verified output (run twice)

**Run 1:**
```
Sequential (1 thread, 4x the work, one after another): 1.58s
Threading  (4 threads, running 'concurrently'):        1.97s
Multiprocessing (4 processes, running in parallel):   0.56s

threading speedup vs sequential:        0.80x
multiprocessing speedup vs sequential:   2.81x
```

**Run 2:**
```
Sequential (1 thread, 4x the work, one after another): 1.56s
Threading  (4 threads, running 'concurrently'):        1.93s
Multiprocessing (4 processes, running in parallel):   0.55s

threading speedup vs sequential:        0.80x
multiprocessing speedup vs sequential:   2.85x
```

Reliable across both runs: threading on 4 threads doing this CPU-bound,
pure-Python loop is *slower* than the sequential baseline (0.80x — the GIL
means the 4 threads never run Python bytecode simultaneously, and
thread-switching adds pure overhead), while multiprocessing on 4 processes
gets real, substantial speedup (~2.8x — each process has its own
interpreter and its own GIL, so they genuinely execute on separate CPU
cores at the same time). Exact multiples vary run to run with machine load
(this machine has 16 cores available), but the qualitative pattern —
threading near/below 1x, multiprocessing meaningfully above 1x — reproduced
both times.

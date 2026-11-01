# Java Interview Prep (Core Java / OOP)

A plain, framework-free Java project for senior-software-engineer interview prep.
Every concept is a small, self-contained, **compiling and runnable** example under
`com.interviewprep.*`, with comments explaining the *why*, not just the *what*.

No Maven/Gradle — just `javac`/`java` directly, using JDK 25.

## Layout

```
src/com/interviewprep/
  oop/              Inheritance, polymorphism (dynamic dispatch), encapsulation, abstraction
  interfaces/        Interface vs abstract class, with a real example of each
  equalshashcode/     The equals()/hashCode() contract, correct vs broken, HashSet proof
  generics/           Generic class, generic method with a bounded type parameter, type erasure
  collections/        List vs Set vs Map, ArrayList vs LinkedList Big-O tradeoffs
  exceptions/         Checked vs unchecked, try-with-resources, a custom checked exception
  streams/            Streams API (filter/map/reduce/collect) vs the imperative equivalent
  concurrency/        Runnable/Thread, synchronized, a real race condition and its fix
  solid/              SRP and OCP: bad (violating) vs good (compliant) before/after refactors
```

Each package has one or more `*Demo.java` classes with a `main` method you run directly.

## Build once, run any demo

```bash
cd /home/openclaw/projectsv1/interview-prep-languages/java
mkdir -p out
javac -d out $(find src -name "*.java")
```

This compiles **every** file in the project in one pass into `out/`. Re-run this
single command any time after editing — no incremental build needed, the whole
project compiles in well under a second.

Then run whichever demo you want with `java -cp out <fully.qualified.ClassName>`:

### 1. OOP fundamentals — inheritance, polymorphism, encapsulation, abstraction
```bash
java -cp out com.interviewprep.oop.PolymorphismDemo
```
`Shape` is an abstract class (abstraction + a private, encapsulated `color` field).
`Circle`, `Rectangle`, `Triangle` extend it (inheritance). The demo holds them all
in a `List<Shape>` and calls `describe()`/`area()`/`perimeter()` through the base
type — the JVM dispatches to each object's actual override at runtime (dynamic
dispatch), which is the mechanism behind polymorphism.

### 2. Interfaces vs abstract classes
```bash
java -cp out com.interviewprep.interfaces.InterfaceVsAbstractDemo
```
`AbstractAnimal` (abstract class) holds shared state (`name`, `energy`) and a
template method (`performDailyRoutine()`). `Drawable` (interface) is a pure
capability contract implemented by unrelated classes. `Dog`/`Cat` are both.
`AbstractAnimal.java` has the full "when to choose which" explanation in its
Javadoc comment.

### 3. equals()/hashCode() contract
```bash
java -cp out com.interviewprep.equalshashcode.EqualsHashCodeDemo
```
`Point` correctly overrides both; `BrokenPoint` overrides only `equals()`. The
demo puts a `Point` and a `BrokenPoint` with identical field values into two
`HashSet`s and looks up a *different instance* with the same values:
- `Point`: `contains()` → `true` (correct pair found via matching hash bucket)
- `BrokenPoint`: `contains()` → `false` (identity-based default hash code sent
  it to the wrong bucket, even though `equals()` says they're equal)

**Verified output** (this is what actually printed, not just the claim):
```
points.contains(new Point(1, 2)) = true
brokenPoints.contains(new BrokenPoint(1, 2)) = false
a.equals(b)   = true
a.hashCode()  = 2124308362
b.hashCode()  = 146589023   <- different, contract violated
```

### 4. Generics
```bash
java -cp out com.interviewprep.generics.GenericsDemo
```
`Box<T>` (generic class), `Pair<K,V>` (two type parameters), and
`GenericMethods.max(List<T>)` with `<T extends Comparable<T>>` (bounded generic
method). Type erasure is explained in `GenericMethods.java`'s comment and
demonstrated live (`List<Integer>` and `List<String>` share the same runtime
`.getClass()`).

### 5. Collections framework
```bash
java -cp out com.interviewprep.collections.CollectionsDemo
```
Shows `List` (order + duplicates), `Set` (dedup), `Map` (key→value) used where
each is actually appropriate, plus a timed `ArrayList` vs `LinkedList`
comparison: O(1) `get(middle)` for `ArrayList` vs O(n) for `LinkedList`, and
O(n) `add(0, x)` for `ArrayList` vs O(1) for `LinkedList` — the real tradeoff,
not just a claim. (Timings are illustrative — JIT warm-up and machine load can
shift exact numbers between runs — but the relative Big-O pattern is reliable.)

### 6. Exception handling
```bash
java -cp out com.interviewprep.exceptions.ExceptionsDemo
```
`InsufficientFundsException` (custom **checked** exception) vs
`IllegalArgumentException` (**unchecked**) thrown from `BankAccount`, plus
try-with-resources with `LoggingResource` (`AutoCloseable`) — including proof
that `close()` runs even when an exception is thrown inside the `try` block.
`ExceptionsDemo.java`'s comment gives an honest, non-textbook take on why
checked exceptions are controversial in modern Java.

### 7. Streams API
```bash
java -cp out com.interviewprep.streams.StreamsDemo
```
A real `filter → map → reduce`/`collect` pipeline over a `List<Employee>`
(total salary by department, sorted high earners, `groupingBy` + averaging),
plus the equivalent hand-written imperative loop for the first computation,
to compare directly.

### 8. Multithreading basics — the race condition
```bash
java -cp out com.interviewprep.concurrency.RaceConditionDemo
```
50 threads × 100,000 increments each (expected total: 5,000,000) run against
an `UnsafeCounter` (plain `count++`, not synchronized) and then against a
`SafeCounter` (`synchronized` methods). **Verified across 5 separate runs**:
the unsynchronized version lost between ~2.3M and ~4.2M increments every
single time (never equal to 5,000,000, never higher — only lost, never
double-counted), while the synchronized version hit exactly 5,000,000 on every
run. Sample output:
```
--- WITHOUT synchronization (UnsafeCounter) ---
Actual total: 2722126
RACE CONDITION CONFIRMED: lost 2277874 increments ...

--- WITH synchronization (SafeCounter) ---
Actual total: 5000000
CORRECT: synchronized prevented every lost update.
```

### 9. SOLID — SRP and OCP before/after
```bash
java -cp out com.interviewprep.solid.SolidDemo
```
- **SRP**: `InvoiceBad` (one class doing math + printing + "persistence") vs
  `InvoiceCalculator`/`InvoicePrinter`/`InvoiceRepository` (three focused
  classes, each with one reason to change).
- **OCP**: `AreaCalculatorBad` (an `if/else instanceof` chain that must be
  edited for every new shape) vs `AreaCalculatorGood` + the `OcpShape`
  interface, where adding `OcpTriangle` required editing **zero** existing
  classes.

## Verification performed

- `javac -d out $(find src -name "*.java")` — compiles all 34 `.java` files
  with **zero errors and zero warnings**.
- Every `*Demo.java` was run directly and its output was read and checked
  against what its comments claim (see the per-example notes above).
- The race-condition demo was run 5 times in a row specifically to confirm
  the lost-update behavior is reliably observable, not a one-off fluke — it
  reproduced every time.
- The `HashSet` lookup demo's actual printed `true`/`false` and hash code
  values are copied verbatim into this README from a real run, not asserted
  from memory.

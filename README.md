# Interview-Prep Language & Framework Demos

Seven real, working projects — one each for TypeScript, JavaScript, React, Angular, Java,
Spring Boot, and Python — built to cover the concepts that actually come up in senior
software engineering interviews, with working code and comments that explain **why**
each concept matters, not just what the syntax does.

This isn't a reference manual reproducing every corner of each language. It's a
deliberately curated tour of the concepts that separate a mid-level answer from a
senior one: closures and the event loop in JavaScript, generics and discriminated
unions in TypeScript, hooks and re-render behavior in React, change detection and DI
in Angular, the equals/hashCode contract and race conditions in Java, a real,
live-tested CRUD API in Spring Boot, and the GIL/decorators/generators mechanics
underneath idiomatic Python.

**Every example was actually run and verified, not just written.** Where the correct
behavior is subtle or counter-intuitive — the order setTimeout/Promise callbacks
actually fire in, whether a race condition is really observable, whether a REST
endpoint really returns the right status code — the project's own README documents
the real, observed output, not an assumption of what "should" happen.

## Projects

| Project | What it covers | How to run |
|---|---|---|
| [`typescript/`](typescript/) | Interfaces vs types, generics, utility types, discriminated unions, type narrowing, enums vs literals, decorators, async/await, mapped/conditional types, `any`/`unknown`/`never` | `cd typescript && npm install`, see its own README |
| [`javascript/`](javascript/) | Closures, `this` binding, prototypal inheritance, the event loop, promises/async-await, destructuring/spread, higher-order functions, currying, debounce/throttle, `==` vs `===`, hoisting/TDZ, generators | `cd javascript && node 01-closures.js` (each file is standalone) |
| [`react/`](react/) | useState/useEffect/useMemo/useCallback/useRef/useContext, custom hooks, controlled vs uncontrolled forms, why list keys matter, React.memo, a real virtual-DOM/batching demo | `cd react && npm install && npm run dev` |
| [`angular/`](angular/) | Components & `@Input`/`@Output`, dependency injection, lifecycle hooks, RxJS basics, two-way binding, directives, change detection (Default vs OnPush) | `cd angular && npm install && npm start` |
| [`java/`](java/) | OOP (inheritance/polymorphism), interfaces vs abstract classes, the equals/hashCode contract, generics, collections, exceptions, Streams, a real race condition + fix, SOLID principles | `cd java && javac -d out $(find src -name "*.java")`, see its own README |
| [`spring-boot/`](spring-boot/) | Constructor DI, layered architecture, a real CRUD REST API, JPA/Hibernate with H2, Bean Validation, centralized exception handling | `cd spring-boot && ./mvnw spring-boot:run`, see its own README |
| [`python/`](python/) | Mutable default arguments, decorators, generators/`yield`, context managers, `*args`/`**kwargs`, comprehensions vs generator expressions, shallow vs deep copy, the GIL (threading vs multiprocessing), OOP/dunder methods, duck typing vs `typing.Protocol`, exception handling, `is` vs `==`/interning | `cd python && python3 01-mutable-default-arguments.py` (each file is standalone), see its own README |

Each project has its own `README.md` with the full file-by-file breakdown, exact
commands, and (where it matters) the actual verified output.

## How this was built

Each project was built and independently verified for real:

- **TypeScript**: `tsc --noEmit` passes with zero errors across the whole project;
  every runnable example was actually executed with `node` and its output checked.
  One genuine limitation documented honestly: Node's native TypeScript execution only
  strips type annotations — it can't run `enum`/decorator syntax directly, so those
  two files compile via `tsc` first, called out explicitly rather than hidden.
- **JavaScript**: every file actually run with `node`; the event-loop ordering and
  `var`/`let` closure-in-a-loop examples — the two places intuition is most often
  wrong — have their real, observed output pasted into the project README.
- **React**: `npm run build` (TypeScript + Vite) succeeds with zero errors; the dev
  server was started and curled to confirm it actually serves transformed TSX.
- **Angular**: `ng build` succeeds with zero errors/warnings; `ng serve` was started
  and curled to confirm a real 200 response, then shut down cleanly.
- **Java**: compiles cleanly with `javac`, every demo's `main` method actually run.
  The race-condition demo was run 5 times to confirm the bug is reliably observable
  (never hits the correct count unsynchronized, always correct once `synchronized` is
  added) — not a one-off flake.
- **Spring Boot**: `./mvnw clean package` succeeds (7/7 tests passing); the built jar
  was actually started and every CRUD endpoint exercised live with `curl` against a
  real running H2-backed server — create, read, filter, 404, validation failure,
  update, partial update, delete, and confirm-delete all show real HTTP responses in
  the project's own README.
- **Python**: every file actually run with `python3` (3.12.3) and every file also
  passes `python3 -m py_compile` cleanly. The three riskiest claims — the mutable
  default argument bug, the shallow-vs-deep-copy shared-reference bug, and the
  GIL threading-vs-multiprocessing timing demo — were each run and (for the GIL demo)
  re-run to confirm the pattern reproduces, with the real, observed output pasted
  into the project's own README rather than assumed.

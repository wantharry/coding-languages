# JavaScript Core Mechanics — Senior Interview Prep

Plain JavaScript (ES2020+, no TypeScript, no build step) demonstrating the
language mechanics that senior interviews actually probe — the parts that
trip up people who've only ever worked through a framework, not the
language underneath it.

Every file is standalone, runnable, heavily commented, and has been
**actually executed with Node** to verify its printed output matches what
the comments claim. This matters most for the event-loop ordering example
and the `var`/`let` closure-in-a-loop bug, which is exactly where intuition
tends to be wrong — those two files include the real, verified console
output inline, not just a predicted one.

## Requirements

- Node.js (tested on v22.22.0). No `npm install` needed — zero dependencies.

## How to run any example

```bash
node <filename>.js
```

Each file is self-contained and prints its own labeled output sections.

## File list and what each one demonstrates

| File | Topic | Highlights |
|---|---|---|
| [`01-closures.js`](01-closures.js) | Closures | A counter factory with truly private state, a memoization cache backed by a closure over a `Map`, and the IIFE pattern for fixing a loop-capture bug (the manual precursor to what `let` now does automatically). |
| [`02-this-binding.js`](02-this-binding.js) | `this` binding | Implicit vs. default vs. explicit (`call`/`apply`/`bind`) binding, arrow functions having *no `this` of their own* (they capture it lexically), and a real bug: a class method passed as a bare callback losing its receiver, with two real fixes (`bind` in the constructor, and an arrow-function class field). |
| [`03-prototypal-inheritance.js`](03-prototypal-inheritance.js) | Prototypal inheritance | Building a prototype chain by hand with `Object.create`, walking it explicitly, `hasOwnProperty`/`Object.hasOwn` vs. `in`, then the exact same relationship rebuilt with `class extends` to show `class` is sugar over the same mechanism — including proof that methods live once on the prototype, not copied per instance. |
| [`04-event-loop.js`](04-event-loop.js) | Event loop: call stack, macrotasks, microtasks | The classic `console.log` + `setTimeout` + `Promise.then` ordering demo, plus an async/await version showing that calling an async function runs synchronously up to its first `await`. **Verified actual output included and matches the predicted order exactly** (see below). |
| [`05-promises-async-await.js`](05-promises-async-await.js) | Promises & async/await | `try/catch` around `await` vs. `.catch()` chains, a real bug (forgetting `await` breaks `try/catch`'s ability to catch the eventual rejection), and `Promise.all` (fails fast, loses other results) vs. `Promise.allSettled` (never rejects, gives every outcome) vs. `Promise.race` (settles on whichever finishes first, win or lose). |
| [`06-destructuring-spread-rest.js`](06-destructuring-spread-rest.js) | Destructuring, spread, rest | Nested object/array destructuring with defaults and renaming, the default-triggers-on-`undefined`-not-`null` gotcha, array destructuring/swapping, rest in destructuring, function-parameter destructuring (and why `= {}` guards against calling with no arguments), rest parameters vs. the old `arguments` object, and the shallow-copy gotcha (spread does **not** deep clone — demonstrated with a real mutation leak, fixed with `structuredClone`). |
| [`07-higher-order-functions.js`](07-higher-order-functions.js) | map/filter/reduce from first principles | Hand-rolled `myMap`, `myFilter`, and `myReduce` implementations, then a proof that `map`/`filter` are just special cases of `reduce` by reimplementing them purely in terms of it, plus an immutability check and a realistic chained pipeline over order data. |
| [`08-currying-composition.js`](08-currying-composition.js) | Currying & composition | Manual currying, then a generic `curry()` helper that works for any fixed-arity function (based on `fn.length`), a partial-application example (a pre-configured logger), and `compose` (right-to-left) vs. `pipe` (left-to-right) with a string-slugify example and a numeric pipeline. |
| [`09-debounce-throttle.js`](09-debounce-throttle.js) | Debounce vs. throttle | Real implementations of both, run against a simulated burst of rapid events followed by one isolated late event, with the actual verified call counts and a line-by-line trace explaining exactly why debounce collapses the burst down to very few calls (fires only after things go quiet) while throttle fires periodically *during* the burst (fires on a steady cadence). |
| [`10-equality-coercion.js`](10-equality-coercion.js) | `==` vs. `===` and coercion that matters | The practically important coercion cases (numeric strings, booleans, the `null == undefined` special case and why `if (x == null)` is a legitimate deliberate idiom, `NaN` never equaling anything including itself, signed zero, and object-to-primitive coercion via `valueOf`/`toString`) — not an exhaustive truth table. |
| [`11-var-let-const-hoisting.js`](11-var-let-const-hoisting.js) | `var`/`let`/`const`, hoisting, TDZ, scope | `var` hoisted-and-initialized-to-`undefined` vs. `let`/`const` hoisted-but-in-the-temporal-dead-zone, function scope vs. block scope, `const` protecting the binding but not the object's contents, and **the canonical broken-loop-closure bug**: scheduling callbacks inside a `var` loop (they all see the loop's final value) vs. a `let` loop (each gets its own per-iteration binding) — with verified actual output for both. |
| [`12-generators-iterators.js`](12-generators-iterators.js) | Generators & iterators | A step-by-step walk through `function*`/`yield` pausing and resuming, generators as iterables (`for...of`, spread), two-way communication via `.next(value)`, an infinite lazy sequence consumed safely, a custom iterable class implemented via a `[Symbol.iterator]` generator method, and `yield*` delegation. |

## The two "verify or it doesn't count" examples

### Event loop ordering (`04-event-loop.js`)

Round 1 (`console.log` + `setTimeout` + two `Promise.then`s), actual verified
output:

```
1: sync - script start
2: sync - script end
3: microtask - first Promise.then
4: microtask - second Promise.then (chained after the first)
5: macrotask - setTimeout callback
```

All synchronous code finishes first; both microtasks drain completely
before the single queued macrotask gets a turn — even though the
`setTimeout` was registered earlier in the source with a `0ms` delay.

Round 2 (async/await), actual verified output:

```
B: before calling asyncFlow()
A: inside asyncFlow, before await
C: after calling asyncFlow() (still synchronous)
D: inside asyncFlow, after await (ran as a microtask)
E: setTimeout macrotask, runs dead last
```

Calling an async function does **not** immediately "go async" — it runs
synchronously up to its first `await`, which is why `A` prints before `C`.

### `var` vs `let` in a loop with closures (`11-var-let-const-hoisting.js`)

Three callbacks scheduled with `setTimeout` inside a `var` loop vs. three
scheduled inside a `let` loop, actual verified output:

```
[var]  callback sees vi = 3
[var]  callback sees vi = 3
[var]  callback sees vi = 3
[let]  callback sees li = 0
[let]  callback sees li = 1
[let]  callback sees li = 2
```

With `var` (function-scoped, one shared binding for the whole loop), every
callback reads the same final value the loop variable had when the loop
condition failed. With `let` (block-scoped, a fresh binding is created
*and* initialized from the previous iteration's value on every pass), each
callback closes over its own iteration's value.

## What's intentionally not here

No TypeScript, no bundler, no test framework, no `node_modules`. Each file
is meant to be read top to bottom and run on its own with plain `node`.

/**
 * `any` vs `unknown` vs `never`
 * ================================
 *
 * This trio comes up constantly in senior interviews because misusing any
 * one of them is a common, genuinely consequential code-review finding —
 * unlike some trivia questions, getting this wrong has real bug
 * consequences, not just style implications.
 *
 * - `any`   = "trust me, don't check this." It OPTS OUT of type checking
 *              entirely for that value — it's not just "unknown type", it's
 *              "stop looking." It's also CONTAGIOUS: anything derived from
 *              an `any` becomes `any` too, silently, which is how a single
 *              untyped boundary (an untyped JSON.parse, an old JS import,
 *              a careless cast) can erode type safety across an entire
 *              call chain without a single error ever appearing.
 * - `unknown` = "this could be anything, and the compiler will MAKE YOU
 *              prove what it is before you can use it." Same breadth as
 *              `any` (anything is assignable to it) but zero operations
 *              are allowed on it until you narrow (file 05) — it's the
 *              type-safe counterpart to `any` for exactly the situations
 *              `any` gets reached for out of habit (parsing unknown JSON,
 *              catch blocks, data from `fetch`).
 * - `never`  = "this code path cannot produce a value at all." Not "no
 *              value yet", not "null" — genuinely, provably unreachable
 *              (a function that always throws, an exhaustiveness check
 *              that has run out of union members, the empty intersection
 *              of two incompatible types). Its main practical use is
 *              exhaustiveness checking, already shown in file 04.
 */

// --- `any`: what goes wrong ---------------------------------------------------
function parseConfigUnsafe(json: string): any {
  return JSON.parse(json); // JSON.parse itself returns `any` — this is realistic
}

function demoAnyDanger(): void {
  const config = parseConfigUnsafe('{"retries": 3}');
  // None of these are caught at compile time, because `config` is `any`:
  const retries: number = config.retries; // fine, by luck
  const typoedField = config.retrias; // TYPO — `undefined` at runtime, no warning
  const nonsense: string = config.retries.toUpperCase?.() ?? "n/a"; // also "fine" to the compiler
  console.log("any demo:", retries, typoedField, nonsense);
  // The bug (`retrias` instead of `retries`) only surfaces at runtime, if
  // at all — exactly the class of bug a type system exists to catch, and
  // exactly the class `any` disables.
}
demoAnyDanger();

// --- `unknown`: the safe replacement -----------------------------------------
function parseConfigSafe(json: string): unknown {
  return JSON.parse(json);
}

interface AppSettings {
  retries: number;
}
function isAppSettings(value: unknown): value is AppSettings {
  return (
    typeof value === "object" &&
    value !== null &&
    "retries" in value &&
    typeof (value as Record<string, unknown>).retries === "number"
  );
}

function demoUnknownSafety(): void {
  const parsed = parseConfigSafe('{"retries": 3}');
  // parsed.retries; // compile error if uncommented — `unknown` allows NO
  //                    property access at all until narrowed.
  if (isAppSettings(parsed)) {
    console.log("unknown demo, narrowed safely:", parsed.retries); // parsed: AppSettings here
  }
}
demoUnknownSafety();

// --- `never`: functions that never return normally --------------------------
// A function typed to return `never` promises the CALLER that execution
// will not continue past the call — useful for assertion helpers, where
// the whole point is to narrow the caller's types by eliminating a branch.
function assertIsString(value: unknown, context: string): asserts value is string {
  if (typeof value !== "string") {
    throw new TypeError(`${context}: expected a string, got ${typeof value}`);
  }
}

function fail(message: string): never {
  throw new Error(message);
}

function demoNever(value: unknown): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  // Calling a function that returns `never` here tells TypeScript this
  // branch doesn't fall through — handy in a function whose return type
  // requires every path to return, like this one.
  return fail(`demoNever: unsupported value ${JSON.stringify(value)}`);
}
console.log("never demo (normal path):", demoNever("ok"));

try {
  demoNever(42);
} catch (err) {
  console.log("never demo (failure path) threw as expected:", (err as Error).message);
}

// `assertIsString` in action — after calling it without it throwing,
// TypeScript narrows `maybeName` to `string` for the rest of the function,
// the same way a custom type guard (file 05) narrows after an `if`.
function greet(maybeName: unknown): string {
  assertIsString(maybeName, "greet() argument");
  return `Hello, ${maybeName.toUpperCase()}!`; // maybeName: string here
}
console.log(greet("world"));

// --- The practical rule of thumb --------------------------------------------
// If you're about to type something `any` because you "don't know the
// shape yet" or "don't want to deal with it right now" — that is almost
// always `unknown`. Reach for `any` deliberately and rarely: genuinely
// untyped third-party JS with no `.d.ts`, or a narrow, well-commented
// escape hatch — never as the default for "I'm not sure."

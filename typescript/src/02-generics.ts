/**
 * GENERICS
 * ========
 *
 * Generics exist to preserve type information across a boundary (a function
 * call, a class, a data structure) without giving up type safety the way
 * `any` would. The interview-relevant mental model: a generic parameter is
 * a variable *at the type level* — it lets the caller's concrete type flow
 * through to the return value, instead of the function erasing it to `any`
 * or forcing you to write the same function once per type.
 *
 * The most common senior-level mistake interviewers look for: using a
 * generic where a union would do, or vice versa. A generic is for "the
 * input and output are related by the SAME unknown type"; a union is for
 * "this value is one of a FIXED set of known types".
 */

// --- A generic function: identity, but useful -------------------------------
// Without the generic, `first(arr: any[]): any` would compile the array's
// element type information at the door. With `<T>`, whatever type you pass
// in is the type you get back out — no cast needed by the caller.
function first<T>(items: readonly T[]): T | undefined {
  // `noUncheckedIndexedAccess` is on in this project's tsconfig, so indexing
  // an array gives `T | undefined` even without this guard — but writing it
  // explicitly here makes the intent obvious rather than relying on a
  // compiler flag the reader may not know is set.
  return items.length > 0 ? items[0] : undefined;
}

console.log("first(numbers) =", first([1, 2, 3])); // inferred T = number
console.log("first(strings) =", first(["a", "b"])); // inferred T = string
console.log("first(empty) =", first([] as number[])); // T = number, value undefined

// --- Multiple type parameters, inferred independently -----------------------
function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}
const p = pair("id-42", 42);
console.log("pair =", p); // p: [string, number]

// --- Generic constraints with `extends` -------------------------------------
// `extends` on a generic parameter is NOT inheritance here — it's a
// constraint: "T may be any type, as long as it has at least this shape."
// This is one of the most-tested generics concepts in interviews because it
// combines generics with structural typing (file 01) in one feature.
interface HasId {
  id: string;
}

function findById<T extends HasId>(items: readonly T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

interface User extends HasId {
  name: string;
}
const users: User[] = [
  { id: "u1", name: "Alice" },
  { id: "u2", name: "Bob" },
];
console.log("findById(users, 'u2') =", findById(users, "u2"));

// --- `keyof` + a constrained generic: a type-safe property getter ----------
// This is the pattern behind libraries like Lodash's `get`, but fully typed:
// `K` is constrained to be one of the actual keys of `T`, so
// `getProperty(user, "nope")` is a COMPILE error, not a runtime surprise.
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const alice = users[0]!; // non-null assertion: we know index 0 exists here
console.log("getProperty(alice, 'name') =", getProperty(alice, "name"));
// The next line is intentionally left as a comment — uncommenting it is a
// compile error, which is the whole point of the constraint:
// getProperty(alice, "nope");

// --- A generic class: a tiny type-safe stack --------------------------------
// Generic classes let a single implementation serve any element type while
// every method signature stays precise for that instance's `T`.
class Stack<T> {
  #items: T[] = [];

  push(item: T): void {
    this.#items.push(item);
  }

  pop(): T | undefined {
    return this.#items.pop();
  }

  peek(): T | undefined {
    return this.#items.at(-1);
  }

  get size(): number {
    return this.#items.length;
  }
}

const stack = new Stack<string>();
stack.push("first");
stack.push("second");
console.log("stack.peek() =", stack.peek(), "stack.size =", stack.size);
console.log("stack.pop() =", stack.pop());

// --- Default type parameters ------------------------------------------------
// Like default function parameters, but for the type system: if the caller
// doesn't specify `T`, it falls back to `unknown` rather than silently
// becoming `any`. This keeps a "forgot to specify the type" mistake visible
// (you'll get `unknown`-related errors) instead of invisible.
class Box<T = unknown> {
  // Written out as a field + plain assignment rather than a constructor
  // parameter property (`constructor(public readonly value: T)`). That
  // shorthand is valid TypeScript and type-checks fine, but it needs real
  // code generation, not just type-erasure — so it can't be run directly
  // with `node file.ts` (see 06/07 for the same limitation with enums and
  // decorators). Spelling it out keeps this file runnable as-is.
  readonly value: T;
  constructor(value: T) {
    this.value = value;
  }
}
const untypedBox = new Box("surprise"); // T inferred as string from the argument
const explicitBox = new Box<number>(42);
console.log(untypedBox.value, explicitBox.value);

// --- A generic utility pattern: a typed, memoizing wrapper -------------------
// This is the kind of generic HOF (higher-order function) that shows up in
// real codebases: it wraps ANY function while preserving its exact
// parameter and return types, which is only possible because `memoize` is
// itself generic over the wrapped function's type.
function memoize<Args extends unknown[], R>(fn: (...args: Args) => R): (...args: Args) => R {
  const cache = new Map<string, R>();
  return (...args: Args): R => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

let slowCallCount = 0;
const slowSquare = (n: number): number => {
  slowCallCount += 1;
  return n * n;
};
const fastSquare = memoize(slowSquare);
console.log("fastSquare(4) =", fastSquare(4));
console.log("fastSquare(4) again =", fastSquare(4));
console.log("slowSquare was actually called", slowCallCount, "time(s)");

/**
 * TYPE NARROWING AND TYPE GUARDS
 * ================================
 *
 * "Narrowing" is TypeScript refining a broader type (often a union) down to
 * a more specific one WITHIN a branch of code, based on a runtime check it
 * recognizes. It's the mechanism that makes unions (file 04) usable without
 * constant manual casting. Interviewers care about this because it's the
 * difference between "fighting the type checker with `as`" and "writing
 * code the type checker actually understands."
 */

// --- `typeof` narrowing ------------------------------------------------------
function describe(value: string | number | boolean): string {
  if (typeof value === "string") {
    return `string of length ${value.length}`; // value: string here
  }
  if (typeof value === "number") {
    return `number, ${value % 2 === 0 ? "even" : "odd"}`; // value: number here
  }
  return `boolean, ${value ? "truthy" : "falsy"}`; // value: boolean by elimination
}
console.log(describe("hey"), "|", describe(4), "|", describe(false));

// --- `instanceof` narrowing --------------------------------------------------
// Useful specifically for class instances and built-in error types — this
// is the standard way to distinguish error subtypes in a `catch` block
// (see file 08 for the full async error-handling version of this).
// Fields spelled out explicitly rather than as constructor parameter
// properties (`constructor(public readonly field: string, ...)`) — that
// shorthand needs real codegen and can't run via Node's native, strip-only
// TypeScript support. See the comment on `Box` in 02-generics.ts.
class ValidationError extends Error {
  readonly field: string;
  constructor(field: string, message: string) {
    super(message);
    this.field = field;
    this.name = "ValidationError";
  }
}
class NetworkError extends Error {
  readonly statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "NetworkError";
  }
}

function describeError(err: unknown): string {
  if (err instanceof ValidationError) {
    return `validation failed on "${err.field}": ${err.message}`;
  }
  if (err instanceof NetworkError) {
    return `network error ${err.statusCode}: ${err.message}`;
  }
  if (err instanceof Error) {
    return `unexpected error: ${err.message}`;
  }
  return `non-Error thrown: ${String(err)}`;
}
console.log(describeError(new ValidationError("email", "must be a valid address")));
console.log(describeError(new NetworkError(503, "service unavailable")));
console.log(describeError("just a string"));

// --- `in` narrowing -----------------------------------------------------------
// Narrows a union of object types by checking for the PRESENCE of a
// property, rather than a `kind` discriminant. Useful when the union comes
// from a third-party type you can't add a discriminant field to.
interface Cat {
  meow(): string;
}
interface Robot {
  beep(): string;
}
function makeSound(entity: Cat | Robot): string {
  if ("meow" in entity) {
    return entity.meow(); // entity: Cat here
  }
  return entity.beep(); // entity: Robot here
}
console.log(makeSound({ meow: () => "Meow!" }));
console.log(makeSound({ beep: () => "Beep!" }));

/**
 * --- Custom type guards: functions returning `arg is T` --------------------
 *
 * This is the advanced piece interviewers probe for: a regular function
 * that returns `boolean` only tells the CALLER something at runtime — it
 * doesn't tell the TYPE CHECKER anything, so the type doesn't narrow after
 * calling it. A function whose return type is the special predicate form
 * `arg is T` (a "user-defined type guard") teaches the compiler the same
 * fact it would have learned from a `typeof`/`instanceof` check, for any
 * condition you can express in code — including shape checks on plain data
 * (e.g. parsed JSON) that has no runtime class to `instanceof` against.
 */
interface Dog {
  kind: "dog";
  bark(): string;
}
interface Bird {
  kind: "bird";
  chirp(): string;
}
type Pet = Dog | Bird;

// Note the return type: `pet is Dog`, not `boolean`.
function isDog(pet: Pet): pet is Dog {
  return pet.kind === "dog";
}

function petSound(pet: Pet): string {
  if (isDog(pet)) {
    return pet.bark(); // narrowed to Dog by the predicate, not just `kind` matching
  }
  return pet.chirp(); // narrowed to Bird by elimination
}
console.log(petSound({ kind: "dog", bark: () => "Woof!" }));
console.log(petSound({ kind: "bird", chirp: () => "Tweet!" }));

// A more realistic use: validating `unknown` data (e.g. from `JSON.parse`
// or an HTTP response) at the boundary of your program, where you have NO
// compile-time guarantee about its shape at all.
interface ApiUser {
  id: string;
  name: string;
}
function isApiUser(value: unknown): value is ApiUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    typeof (value as Record<string, unknown>).id === "string" &&
    typeof (value as Record<string, unknown>).name === "string"
  );
}

function processUnknownPayload(payload: unknown): string {
  if (isApiUser(payload)) {
    return `got a real user: ${payload.name} (${payload.id})`;
  }
  return "payload did not match ApiUser shape";
}
console.log(processUnknownPayload({ id: "u1", name: "Grace" }));
console.log(processUnknownPayload({ foo: "bar" }));

// --- Truthiness narrowing + the `??`/optional-chaining combo ---------------
// Narrowing also happens on plain truthiness checks, which is how
// `strictNullChecks` lets you safely handle `null | undefined` without a
// library. This is the realistic, everyday form most narrowing takes.
function greetUser(name: string | null | undefined): string {
  if (!name) {
    return "Hello, guest!"; // name was null, undefined, or ""
  }
  return `Hello, ${name.toUpperCase()}!`; // name: string, non-empty by this point
}
console.log(greetUser("ravi"), "|", greetUser(null), "|", greetUser(undefined));

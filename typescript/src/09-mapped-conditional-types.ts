/**
 * MAPPED TYPES AND CONDITIONAL TYPES
 * =====================================
 *
 * This is the part of TypeScript that actually separates "comfortable with
 * generics" from "can read and write the type-level code that powers
 * `Partial`, `Pick`, Zod's inferred types, or a typed Redux/React Query
 * layer." You rarely need to invent these from scratch day-to-day, but
 * senior engineers are expected to be able to READ one when it shows up in
 * a library's `.d.ts`, and to write a small one when a project genuinely
 * needs it (as opposed to reaching for `any` out of unfamiliarity).
 *
 * - A MAPPED TYPE takes an existing type and produces a new one by
 *   iterating `[K in keyof T]`, optionally transforming each property's
 *   modifiers (`readonly`, `?`) or value type as it goes. This is literally
 *   how `Partial<T>`, `Readonly<T>`, and `Record<K, V>` are implemented.
 * - A CONDITIONAL TYPE is an `if/else` at the type level: `A extends B ? X
 *   : Y`. Combined with `infer`, it can PATTERN-MATCH a type's structure
 *   and extract a piece of it — this is how `ReturnType<F>` is implemented.
 */

// --- Reading the actual definitions (not reinventing them) ------------------
// This is worth seeing once: these are (close to) the REAL lib.es5.d.ts
// definitions behind the utility types used in file 03.
type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };

interface Draft {
  title: string;
  body: string;
  author: string;
}
const draftPatch: MyPartial<Draft> = { title: "updated title only" };
console.log("MyPartial in action =", draftPatch);

const frozenDraft: MyReadonly<Draft> = { title: "t", body: "b", author: "a" };
// frozenDraft.title = "nope"; // compile error if uncommented — MyReadonly works

const draftByline: MyPick<Draft, "title" | "author"> = { title: "t", author: "a" };
console.log("MyReadonly/MyPick in action =", frozenDraft.body, draftByline);

// --- A genuinely useful custom mapped type: DeepReadonly ---------------------
// The built-in `Readonly<T>` is SHALLOW — it only freezes top-level
// properties; a nested object is still mutable through them. Real
// configs/state trees are nested, so a real codebase often needs this
// recursive version. This is exactly the kind of "wrote one small mapped
// type to solve a real problem" senior engineers are expected to produce.
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

interface AppConfig {
  server: {
    host: string;
    port: number;
  };
  featureFlags: string[];
}

function printConfig(config: DeepReadonly<AppConfig>): void {
  // config.server.port = 9999; // compile error — nested mutation is blocked too
  console.log(`server running at ${config.server.host}:${config.server.port}`);
}
printConfig({ server: { host: "localhost", port: 3000 }, featureFlags: ["beta-ui"] });

// --- Key remapping with `as` in a mapped type --------------------------------
// Since TS 4.1, a mapped type can rename keys as it iterates, using
// template literal types. Real use case: deriving a typed "getters" object
// from a plain data shape, the way some state-management libraries do.
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

function makeGetters<T extends object>(obj: T): Getters<T> {
  const getters = {} as Getters<T>;
  for (const key of Object.keys(obj) as (keyof T)[]) {
    const getterName = `get${String(key).charAt(0).toUpperCase()}${String(key).slice(1)}` as keyof Getters<T>;
    (getters as Record<string, () => unknown>)[getterName as string] = () => obj[key];
  }
  return getters;
}

const point = { x: 10, y: 20 };
const pointGetters = makeGetters(point); // { getX: () => number; getY: () => number }
console.log("pointGetters.getX() =", pointGetters.getX());
console.log("pointGetters.getY() =", pointGetters.getY());

// --- Conditional types with `infer`: pattern-matching a type ----------------
// `infer` captures a piece of a type being matched against, for use on the
// "true" side of the conditional. This is the mechanism `ReturnType<F>`,
// `Awaited<T>`, and `Parameters<F>` are all built from.
type MyReturnType<F> = F extends (...args: never[]) => infer R ? R : never;

function buildReport(): { total: number; items: string[] } {
  return { total: 2, items: ["a", "b"] };
}
type Report = MyReturnType<typeof buildReport>; // { total: number; items: string[] }
const report: Report = { total: 1, items: ["x"] };
console.log("inferred Report shape works =", report);

// Unwrap a Promise type, recursively — this is (a simplified) `Awaited<T>`,
// which matters because `Promise<Promise<T>>` genuinely happens when
// composing async helper functions, and the real unwrap has to recurse.
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;
type Unwrapped = MyAwaited<Promise<Promise<string>>>; // string
const unwrapped: Unwrapped = "fully unwrapped";
console.log(unwrapped);

// --- Distributive conditional types over a union ----------------------------
// A conditional type applied to a UNION (when the checked type is a bare
// type parameter) distributes over each member independently — a subtle
// but real-world-relevant behavior: it's why `ToArray<string | number>`
// below produces `string[] | number[]`, not `(string | number)[]`.
type ToArray<T> = T extends unknown ? T[] : never;
type StringOrNumberArrays = ToArray<string | number>; // string[] | number[]
const arrays: StringOrNumberArrays = ["a", "b"]; // valid: matches the string[] branch
console.log("distributive conditional example =", arrays);

// --- Extracting a union of a type's values, by key filter -------------------
// Combines `keyof`, a mapped type, and indexing in one expression — exactly
// the kind of three-feature combination that shows up in real `.d.ts`
// files and trips people up in interviews until they've seen the pattern
// once. Here: "the union of all property VALUE types whose value is a
// function" (handy for extracting a type of "all method names").
type MethodNames<T> = {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown ? K : never;
}[keyof T];

interface Repository {
  findById(id: string): unknown;
  save(entity: unknown): void;
  tableName: string;
}
type RepositoryMethodName = MethodNames<Repository>; // "findById" | "save"
const methodName: RepositoryMethodName = "save";
console.log("RepositoryMethodName example =", methodName);

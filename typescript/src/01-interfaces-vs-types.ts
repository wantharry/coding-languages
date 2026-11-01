/**
 * INTERFACES vs TYPE ALIASES
 * ==========================
 *
 * The honest senior-level answer to "which should I use?" is: for describing
 * the shape of an object, they are almost interchangeable, and TypeScript
 * uses STRUCTURAL typing either way — it checks "does this value have the
 * right shape?", not "was it declared with this exact name?". That single
 * fact (structural, not nominal, typing) is the thing interviewers are
 * really probing for when they ask this question.
 *
 * Where they genuinely differ:
 *   - `interface` can be re-opened and merged (declaration merging) and
 *     supports `extends` with clearer error messages for object shapes.
 *   - `type` can alias ANYTHING: unions, tuples, primitives, mapped types,
 *     conditional types. `interface` can only describe object/function
 *     shapes (plus hybrid callable interfaces).
 *   - Historically `interface` had better perf in very large structural
 *     comparisons and some editor tooling; this has mostly converged.
 *
 * Practical rule senior engineers actually use: reach for `interface` when
 * modeling an object shape that a class might implement or that a consumer
 * might extend; reach for `type` for everything else (unions, tuples,
 * function types, mapped/conditional types). Don't treat the choice as a
 * religious war — consistency within a codebase matters more than which one
 * "wins".
 */

// --- Structural typing in action -------------------------------------------
// `Point` and `NamedPoint` are declared completely independently, yet a
// `NamedPoint` can be used anywhere a `Point` is expected, because it HAS
// the required shape. This is the opposite of Java/C#'s nominal typing,
// where you'd need an explicit `implements`.
interface Point {
  x: number;
  y: number;
}

interface NamedPoint {
  x: number;
  y: number;
  name: string;
}

function distanceFromOrigin(p: Point): number {
  return Math.sqrt(p.x * p.x + p.y * p.y);
}

const origin: NamedPoint = { x: 3, y: 4, name: "origin-ish" };
// No cast, no `implements Point` needed — the shape alone satisfies it.
console.log("distanceFromOrigin(namedPoint) =", distanceFromOrigin(origin));

// A plain object literal with no declared type at all works too, which is
// the point: TypeScript never asked "what interface is this?", only
// "does it have numeric x and y?".
console.log(
  "distanceFromOrigin(literal) =",
  distanceFromOrigin({ x: 1, y: 1 }),
);

// --- Declaration merging: an interface-only feature -------------------------
// Two separate `interface Window` declarations merge into one combined
// shape. This is how `@types/node` and `@types/dom` style libraries let you
// (or a library) add properties to a global/ambient type from multiple
// files. `type` aliases cannot do this — attempting to redeclare one is a
// compile error, by design, since a type alias is meant to be a single,
// closed definition.
interface Cache {
  get(key: string): string | undefined;
}
interface Cache {
  set(key: string, value: string): void;
}
// `Cache` now has both `get` and `set` — merged from two declarations.
const cache: Cache = {
  get: (key) => (key === "known" ? "value" : undefined),
  set: (_key, _value) => {
    /* no-op for this demo */
  },
};
console.log("merged Cache.get('known') =", cache.get("known"));

// --- `type` can express things `interface` fundamentally cannot ------------
// A union of literal types — there is no `interface` equivalent of this.
type Direction = "north" | "south" | "east" | "west";

// A tuple with fixed arity and per-position types.
type LatLng = [latitude: number, longitude: number];

// A function type alias — interfaces CAN express callable shapes too (see
// below), but a plain `type` reads more naturally for "this is a function".
type Comparator<T> = (a: T, b: T) => number;

const move = (dir: Direction, [lat, lng]: LatLng): LatLng => {
  const delta = 0.01;
  switch (dir) {
    case "north":
      return [lat + delta, lng];
    case "south":
      return [lat - delta, lng];
    case "east":
      return [lat, lng + delta];
    case "west":
      return [lat, lng - delta];
  }
};

const numericAscending: Comparator<number> = (a, b) => a - b;

console.log("move north from [0,0] =", move("north", [0, 0]));
console.log("sorted =", [3, 1, 2].sort(numericAscending));

// --- `extends` vs intersection: nearly the same result, different feel -----
interface Animal {
  name: string;
}
interface Dog extends Animal {
  breed: string;
}

type AnimalT = { name: string };
type DogT = AnimalT & { breed: string };

const fido: Dog = { name: "Fido", breed: "Corgi" };
const rex: DogT = { name: "Rex", breed: "Lab" };
console.log("interface-extends:", fido, " type-intersection:", rex);

// --- A callable interface (interfaces aren't *just* object shapes) ---------
// This is the one place interfaces blur into "type alias" territory: an
// interface can describe something callable, optionally with extra
// properties attached (useful for modeling things like a function that also
// carries a `.cache` map, mirroring how some JS libraries attach state to
// functions).
interface Greeter {
  (name: string): string;
  defaultGreeting: string;
}

function makeGreeter(): Greeter {
  const greet = ((name: string) => `${greet.defaultGreeting}, ${name}!`) as Greeter;
  greet.defaultGreeting = "Hello";
  return greet;
}

const greeter = makeGreeter();
console.log(greeter("Ada"));

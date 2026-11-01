/**
 * UNION TYPES, INTERSECTION TYPES, AND DISCRIMINATED UNIONS
 * ===========================================================
 *
 * - A union (`A | B`) means "this value is EITHER an A OR a B" — you only
 *   know for certain the members common to both until you narrow (file 05).
 * - An intersection (`A & B`) means "this value is BOTH an A AND a B at
 *   once" — all members of both are available immediately.
 * - A DISCRIMINATED union is a union of object types that all share one
 *   common literal-typed field (the "tag" or "discriminant"). This is
 *   arguably the single most important everyday pattern in TypeScript: it's
 *   how you model "one of several possible shapes" — API responses, state
 *   machine states, Redux-style actions, parsed AST nodes — in a way the
 *   compiler can exhaustively check for you.
 */

// --- Plain union ------------------------------------------------------------
type Id = string | number;
function formatId(id: Id): string {
  // Without narrowing you can only call methods common to BOTH string and
  // number (there basically are none useful here) — see file 05 for how
  // `typeof` narrows this to each branch's full API.
  return typeof id === "string" ? id.toUpperCase() : id.toFixed(0);
}
console.log("formatId('abc') =", formatId("abc"), " formatId(42.7) =", formatId(42.7));

// --- Plain intersection ------------------------------------------------------
// Real use case: composing smaller, independently-reusable shapes instead
// of one monolithic interface. `Timestamped & Named` reads as "has both
// of these capabilities", similar in spirit to mixins/traits.
interface Timestamped {
  createdAt: Date;
}
interface Named {
  name: string;
}
type AuditedRecord = Timestamped & Named & { id: string };

const record: AuditedRecord = { id: "r1", name: "Invoice #1", createdAt: new Date() };
console.log("AuditedRecord =", record.name, record.id);

/**
 * --- The discriminated union: Result<T, E> ---------------------------------
 *
 * This is the TypeScript idiom for "a function that can fail" WITHOUT
 * throwing exceptions — the failure is part of the return type, so callers
 * are compile-time FORCED to handle it (or explicitly opt out), unlike a
 * thrown exception which is invisible in a function's signature. Rust and
 * Haskell programmers will recognize this as `Result`/`Either`. It composes
 * naturally with async/await error handling shown in file 08.
 *
 * The discriminant here is the `ok` field: it's a boolean LITERAL in each
 * branch (`true` vs `false`, not just `boolean`), which is what lets
 * TypeScript narrow `result.value` vs `result.error` based on a single
 * `if (result.ok)` check.
 */
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

function parsePort(input: string): Result<number, string> {
  const n = Number(input);
  if (!Number.isInteger(n) || n < 1 || n > 65535) {
    return { ok: false, error: `"${input}" is not a valid port number` };
  }
  return { ok: true, value: n };
}

function handlePortInput(input: string): void {
  const result = parsePort(input);
  if (result.ok) {
    // Inside this branch, TypeScript knows `result` is narrowed to the
    // `{ ok: true; value: number }` member — `result.error` would be a
    // compile error here, not just a runtime `undefined`.
    console.log(`Listening on port ${result.value}`);
  } else {
    // And here, the opposite: only `.error` is available.
    console.log(`Invalid port: ${result.error}`);
  }
}
handlePortInput("8080");
handlePortInput("not-a-number");
handlePortInput("99999");

/**
 * --- The discriminated union: a shape/area example --------------------------
 *
 * The classic textbook example, because it's genuinely the clearest
 * illustration of EXHAUSTIVENESS CHECKING: if a new shape variant is added
 * to the union and a `switch` forgets to handle it, the `never` assignment
 * in `default` fails to compile — turning "forgot a case" from a runtime
 * bug into a build failure, at the exact call site that needs updating.
 */
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default: {
      // If `Shape` gains a new member (say, "square") and this switch isn't
      // updated, `shape` here is no longer `never` — it's the unhandled
      // member — and this line becomes a compile error pointing right at
      // the gap. Try adding a new Shape variant above to see it fire.
      const exhaustive: never = shape;
      throw new Error(`Unhandled shape kind: ${JSON.stringify(exhaustive)}`);
    }
  }
}

const shapes: Shape[] = [
  { kind: "circle", radius: 2 },
  { kind: "rectangle", width: 3, height: 4 },
  { kind: "triangle", base: 5, height: 6 },
];
for (const s of shapes) {
  console.log(`area(${s.kind}) =`, area(s).toFixed(2));
}

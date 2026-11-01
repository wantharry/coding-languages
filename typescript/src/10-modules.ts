/**
 * THE MODULE SYSTEM: import/export, default vs named
 * ======================================================
 *
 * TypeScript's module syntax IS JavaScript's ES module syntax — there's no
 * separate "TypeScript module system" to learn, which is itself a useful
 * interview fact (people sometimes assume otherwise, confusing it with the
 * old, TS-only `namespace`/`module` keyword from pre-ES-module days, which
 * modern TypeScript guidance says to avoid in favor of real ES modules).
 *
 * This file imports from ./modules/math-utils.ts (named exports) and
 * ./modules/logger.ts (a default export + one named export), to show each
 * import style side by side. NOTE: the explicit `.ts` extensions in the
 * import paths below are REQUIRED here — Node's ESM resolution (and this
 * project's "module": "NodeNext" tsconfig setting) needs the real file
 * extension, unlike older bundler-based setups that let you omit it.
 */

// --- Named imports -----------------------------------------------------------
import { add, multiply, approximatelyEqual, vectorLength } from "./modules/math-utils.ts";
// A type-only named import. `import type` makes it explicit, at the import
// site, that `Vector2` contributes NOTHING to the compiled output — it
// exists purely for the type checker. This project's `verbatimModuleSyntax`
// tsconfig option (see tsconfig.json) makes this distinction mandatory
// rather than optional: mixing a type into a plain `import { ... }` when
// it's only ever used as a type becomes a compile error, specifically so
// that every import's runtime-vs-type-only status is unambiguous just by
// reading it, without needing to check how each name is used.
import type { Vector2 } from "./modules/math-utils.ts";

console.log("add(2, 3) =", add(2, 3));
console.log("multiply(4, 5) =", multiply(4, 5));
console.log("approximatelyEqual(0.1 + 0.2, 0.3) =", approximatelyEqual(0.1 + 0.2, 0.3));

const v: Vector2 = { x: 3, y: 4 };
console.log("vectorLength({x:3,y:4}) =", vectorLength(v));

// --- Renaming on import, with `as` ------------------------------------------
import { add as sum } from "./modules/math-utils.ts";
console.log("renamed import: sum(10, 20) =", sum(10, 20));

// --- Default import + named import from the SAME module --------------------
// Note there are no braces around `Logger` — that's the syntactic tell for
// a default import, and (per the file's own comment) the LOCAL name here
// ("Logger") was chosen by this file, not fixed by the module.
import Logger, { type LogLevel } from "./modules/logger.ts";

const logger = new Logger("modules-demo");
const levelsToDemo: LogLevel[] = ["info", "warn"];
for (const level of levelsToDemo) {
  logger.log(level, `demonstrating the "${level}" level`);
}

// --- Namespace import: grouping an entire module under one name -----------
// Useful when a module exports many related names and you'd rather refer
// to them as `MathUtils.add(...)` than import each one individually — a
// style trade-off (explicitness/searchability vs import-list length), not
// a functional difference from named imports.
import * as MathUtils from "./modules/math-utils.ts";
console.log("namespace import: MathUtils.EPSILON =", MathUtils.EPSILON);
console.log("namespace import: MathUtils.add(1, 1) =", MathUtils.add(1, 1));

// --- Re-exports (shown as a comment, not executed) --------------------------
// A barrel file re-exporting from several modules is extremely common in
// real codebases, for a clean public surface:
//   export { add, multiply } from "./math-utils.ts";
//   export { default as Logger } from "./logger.ts";
// This project intentionally keeps its modules flat instead, since a
// barrel file adds nothing pedagogically here — but recognizing this
// pattern (and its cost: it can defeat tree-shaking if overused) is a
// real interview-relevant point.

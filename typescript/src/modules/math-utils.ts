/**
 * A small module demonstrating NAMED exports.
 *
 * Named exports are generally preferred for utility modules like this one
 * because:
 *   - They're grep-able and refactor-friendly: renaming `add` here is a
 *     traceable, tool-assisted rename everywhere it's imported. Renaming a
 *     default export's local name at each import site is invisible to
 *     most refactoring tools, since the importer can call it anything.
 *   - A module can have many named exports, so it scales naturally as a
 *     "bag of related utilities" — which is exactly what this file is.
 *   - Tree-shaking (dead-code elimination in bundlers) works more
 *     reliably with named exports, since the bundler can see exactly
 *     which specific bindings are used.
 */

export const EPSILON = 1e-9;

export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function approximatelyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < EPSILON;
}

// A named export of a TYPE, not just a value — fully erased at runtime,
// but importable the same way as the functions above (see 10-modules.ts
// for the `import type` form that makes the "this is type-only" explicit).
export interface Vector2 {
  x: number;
  y: number;
}

export function vectorLength(v: Vector2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

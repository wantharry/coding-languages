'use strict';

/**
 * var / let / const: HOISTING, THE TEMPORAL DEAD ZONE, AND SCOPE
 * ===================================================================
 *
 * HOISTING: declarations are processed before any code in their scope
 * runs. But var and let/const are hoisted DIFFERENTLY:
 *   - `var` declarations are hoisted AND initialized to `undefined`
 *     immediately. You can reference the variable before its line of
 *     code runs and get `undefined` instead of an error.
 *   - `let`/`const` declarations are hoisted too (the name is reserved
 *     for the whole scope), but NOT initialized. Accessing them before
 *     their declaration line throws a ReferenceError. This gap between
 *     "scope starts" and "declaration line runs" is the TEMPORAL DEAD
 *     ZONE (TDZ).
 *
 * SCOPE: `var` is FUNCTION-scoped (it ignores block boundaries like
 * if/for/while - it only cares about the nearest enclosing function, or
 * global scope). `let`/`const` are BLOCK-scoped (each `{ }` creates a
 * new scope for them).
 *
 * This difference is EXACTLY why the famous "var in a loop + closure"
 * bug exists, and why switching to `let` fixes it for free. This file
 * demonstrates both the bug and the fix, with real, verified output.
 */

console.log('--- Hoisting: var vs let ---');

console.log(typeof hoistedVar); // 'undefined' - var is hoisted AND pre-initialized
try {
  console.log(hoistedLet); // ReferenceError - TDZ: name exists but isn't initialized yet
} catch (err) {
  console.log('Accessing `let` before declaration threw:', err.constructor.name);
}
var hoistedVar = 'now assigned';
let hoistedLet = 'now assigned too';
console.log(hoistedVar, hoistedLet);

console.log('\n--- Scope: function-scoped var vs block-scoped let ---');
function scopeDemo() {
  if (true) {
    var fnScoped = 'I leak out of this if-block';
    let blockScoped = 'I do NOT leak out of this if-block';
    console.log('inside block:', fnScoped, blockScoped);
  }
  console.log('fnScoped outside the if-block:', fnScoped); // works - var ignores block boundaries
  try {
    console.log(blockScoped); // ReferenceError - blockScoped doesn't exist out here
  } catch (err) {
    console.log('blockScoped outside the if-block threw:', err.constructor.name);
  }
}
scopeDemo();

// --- const: the binding is immutable, the VALUE might not be -------------
console.log('\n--- const protects the binding, not the contents ---');
const frozenBinding = { count: 0 };
frozenBinding.count = 1; // fine - we're mutating the object, not reassigning the binding
console.log('mutated contents is fine:', frozenBinding);
try {
  frozenBinding.count = 2; // still fine, same reason
  // eslint-disable-next-line no-const-assign
  frozenBinding = { count: 99 }; // this is the actual error: reassigning the binding itself
} catch (err) {
  console.log('Reassigning a const binding throws:', err.constructor.name);
}

// =============================================================================
// THE CLASSIC BUG: var in a loop that schedules closures
// =============================================================================
//
// The setup: schedule three callbacks (simulated here with setTimeout so the
// closures genuinely run AFTER the loop has fully finished, exactly like a
// real async callback would). Each callback is supposed to print "i is 0",
// "i is 1", "i is 2".

console.log('\n--- THE BUG: var in a loop + setTimeout closures ---');
console.log('Scheduling 3 callbacks with var...');
for (var vi = 0; vi < 3; vi++) {
  setTimeout(() => {
    // BUG: there is only ONE `vi` binding for the entire loop (var is
    // function/global-scoped, not per-iteration). By the time any of
    // these callbacks actually runs (after the loop has already
    // finished and vi has already reached 3), they all close over and
    // read that SAME final value.
    console.log(`  [var]  callback sees vi = ${vi}`);
  }, 10);
}

console.log('Scheduling 3 callbacks with let...');
for (let li = 0; li < 3; li++) {
  setTimeout(() => {
    // FIX: `let` creates a BRAND NEW binding of `li` for every single
    // iteration of the loop. Each closure captures its OWN iteration's
    // binding, not a shared one.
    console.log(`  [let]  callback sees li = ${li}`);
  }, 10);
}

/**
 * ACTUAL VERIFIED OUTPUT (ran with `node 11-var-let-const-hoisting.js`
 * on Node v22; the two scheduling loops run synchronously first, printing
 * their "Scheduling..." lines, and ALL SIX callbacks fire afterward once
 * the call stack is clear and ~10ms has passed):
 *
 *   [var]  callback sees vi = 3
 *   [var]  callback sees vi = 3
 *   [var]  callback sees vi = 3
 *   [let]  callback sees li = 0
 *   [let]  callback sees li = 1
 *   [let]  callback sees li = 2
 *
 * This confirms the textbook claim for real: with `var`, every callback
 * prints the SAME final value (3 - the value `vi` had when the loop
 * condition finally failed), because all three closures reference the
 * one and only `vi` variable that ever existed. With `let`, each
 * callback correctly prints its own iteration's value (0, 1, 2), because
 * the for-loop creates a fresh `let` binding per iteration and copies the
 * previous iteration's value into it before each pass.
 *
 * (Historical note: before `let` existed, the only fix was the IIFE
 * pattern shown in 01-closures.js's `makeAdders` - wrapping the loop body
 * in a function call to manufacture a new scope by hand.)
 */

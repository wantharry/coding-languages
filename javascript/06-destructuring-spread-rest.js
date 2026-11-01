'use strict';

/**
 * DESTRUCTURING, SPREAD, AND REST
 * =================================
 *
 * Destructuring unpacks values from arrays/objects into variables.
 * Spread (`...`) expands an iterable/object into individual elements.
 * Rest (`...`) does the opposite: it collects multiple elements INTO
 * one array/object. Same syntax, opposite direction - context tells
 * you which one you're looking at.
 *
 * Why this matters: modern codebases (React props, Redux reducers,
 * utility functions) lean on these constantly. Interviewers use them to
 * check you understand things like "does spread do a deep copy?" (no -
 * shallow only) and "what happens when a destructured property doesn't
 * exist?" (you get undefined, or your default, not an error).
 */

// --- Object destructuring with defaults and renaming ------------------------
console.log('--- Object destructuring ---');
const apiResponse = { id: 1, userName: 'ada', role: undefined };
const { id, userName: name, role = 'member', isAdmin = false } = apiResponse;
console.log({ id, name, role, isAdmin });
// { id: 1, name: 'ada', role: 'member', isAdmin: false }
// Note: `role` was explicitly `undefined` in the source object, so the
// default DID kick in. Defaults trigger on `undefined`, not on "missing".
// Compare to a key that's truly absent vs present-but-null:
const { missingKey = 'fallback', explicitNull = 'also-fallback?' } = { explicitNull: null };
console.log({ missingKey, explicitNull });
// missingKey -> 'fallback' (key absent)
// explicitNull -> null (present as null; defaults do NOT trigger on null,
// only on undefined - a very common gotcha)

// --- Nested destructuring ----------------------------------------------------
const order = {
  id: 'ORD-1',
  customer: { name: 'Grace', address: { city: 'NYC' } },
  items: [{ sku: 'A1', qty: 2 }, { sku: 'B2', qty: 1 }],
};
const {
  customer: { name: customerName, address: { city } = {} },
  items: [firstItem, ...restItems],
} = order;
console.log('\n--- Nested destructuring ---');
console.log({ customerName, city, firstItem, restItems });

// --- Array destructuring: skipping elements, swapping, defaults ------------
console.log('\n--- Array destructuring ---');
const [, second, , fourth = 'default-4'] = ['a', 'b', 'c'];
console.log({ second, fourth }); // second: 'b', fourth: 'default-4' (index 3 doesn't exist)

let x = 1;
let y = 2;
[x, y] = [y, x]; // the idiomatic swap, no temp variable needed
console.log('swapped:', { x, y }); // { x: 2, y: 1 }

// --- Rest in destructuring: collect the "remaining" items -------------------
console.log('\n--- Rest ---');
const [head, ...tail] = [1, 2, 3, 4];
console.log({ head, tail }); // head: 1, tail: [2, 3, 4]

const { a, ...otherFields } = { a: 1, b: 2, c: 3 };
console.log({ a, otherFields }); // a: 1, otherFields: { b: 2, c: 3 }

// --- Function parameter destructuring (very common in real APIs) ----------
//
// This is THE pattern you see constantly in real codebases for options
// objects: it documents the expected shape right in the signature and
// gives free defaults.
function createUser({ username, email, isActive = true, roles = [] } = {}) {
  return { username, email, isActive, roles };
}
console.log('\n--- Function param destructuring ---');
console.log(createUser({ username: 'grace', email: 'grace@example.com' }));
console.log(createUser()); // the `= {}` default guards against calling with no args at all
try {
  function noGuard({ username }) {
    return username;
  }
  noGuard(); // no default param -> destructuring `undefined` throws
} catch (err) {
  console.log('Without the `= {}` guard, calling with no args throws:', err.constructor.name);
}

// --- Rest parameters vs the old `arguments` object --------------------------
//
// Rest parameters give you a REAL array (with map/filter/reduce etc.),
// unlike the old `arguments` object, which is array-LIKE but not a real
// array, and which doesn't exist at all inside arrow functions.
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
console.log('\n--- Rest parameters ---');
console.log(sum(1, 2, 3, 4)); // 10
console.log(sum());           // 0

function logFirstAndRest(first, ...rest) {
  // `first` takes the first argument; `rest` mops up everything after it.
  console.log('first:', first, 'rest:', rest);
}
logFirstAndRest(1, 2, 3, 4); // first: 1, rest: [2, 3, 4]

// --- Spread: arrays, objects, and function calls ----------------------------
console.log('\n--- Spread ---');
const base = [1, 2, 3];
const extended = [...base, 4, 5]; // shallow copy + append
console.log(extended); // [1, 2, 3, 4, 5]
console.log('base unchanged:', base); // [1, 2, 3] - original untouched

const defaults = { theme: 'dark', fontSize: 14 };
const userPrefs = { fontSize: 18 };
const merged = { ...defaults, ...userPrefs }; // later spreads override earlier keys
console.log(merged); // { theme: 'dark', fontSize: 18 }

// Spread into a function call, splatting an array into individual args:
function add3(a, b, c) {
  return a + b + c;
}
console.log(add3(...[10, 20, 30])); // 60

// --- The shallow-copy gotcha: spread does NOT deep clone --------------------
console.log('\n--- Shallow copy gotcha ---');
const original = { nested: { count: 1 } };
const shallowCopy = { ...original };
shallowCopy.nested.count = 999; // mutates the SHARED nested object
console.log('original.nested.count is also', original.nested.count); // 999 - surprise!
console.log(
  'This is why spread-copied state with nested objects can leak mutations; ' +
    'use structuredClone(original) or a deep-clone utility for real deep copies.'
);
const trueDeepCopy = structuredClone(original);
trueDeepCopy.nested.count = 1;
console.log('deep copy is independent:', original.nested.count, trueDeepCopy.nested.count); // 999 1

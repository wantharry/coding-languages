'use strict';

/**
 * `==` vs `===` AND COERCION THAT ACTUALLY MATTERS
 * ====================================================
 *
 * `===` (strict equality) compares value AND type, no conversion.
 * `==` (loose equality) converts one or both operands to a common type
 * first, following a specific (and infamous) set of rules, THEN
 * compares.
 *
 * The honest senior-level take: "always use ===" is right advice for
 * writing code, but an interview will still probe whether you
 * understand WHY `==` behaves the way it does, because that
 * understanding is what lets you spot coercion bugs in code you didn't
 * write. This file covers the handful of coercion cases that actually
 * show up in real bugs - not the full absurd `==` truth table.
 */

console.log('--- === : no coercion, ever ---');
console.log(1 === '1');   // false - different types, no conversion
console.log(0 === false); // false
console.log(null === undefined); // false - they're distinct in strict terms

console.log('\n--- == : numbers and numeric strings ---');
console.log(1 == '1');     // true - the string is converted to a number
console.log(0 == '');      // true - '' converts to 0 (common surprise)
console.log(0 == '0');     // true
console.log('0' == '');    // false - both are strings here, compared directly, no conversion happens

console.log('\n--- == : booleans get converted to numbers ---');
console.log(true == 1);    // true - true -> 1
console.log(false == 0);   // true - false -> 0
console.log(false == '');  // true - '' -> 0 via number conversion, false -> 0
console.log(true == '1');  // true
console.log(true == 'true'); // false - 'true' cannot convert to a sane number (-> NaN), so this is false

console.log('\n--- == : the null/undefined special case ---');
// null and undefined are loosely equal to EACH OTHER and to NOTHING else.
console.log(null == undefined); // true
console.log(null == 0);         // false - null does not coerce to 0 for ==
console.log(undefined == 0);    // false
console.log(null === null);     // true, trivially

// This is actually a USEFUL, idiomatic pattern: `if (value == null)` is a
// deliberate, well-known shorthand for "value is null OR undefined",
// one of the few places senior engineers genuinely use `==` on purpose.
function describe(value) {
  if (value == null) {
    return 'nothing here (null or undefined)';
  }
  return `value: ${JSON.stringify(value)}`;
}
console.log('\n--- The one legitimate real-world use of == ---');
console.log(describe(null));      // 'nothing here...'
console.log(describe(undefined)); // 'nothing here...'
console.log(describe(0));         // 'value: 0' - importantly NOT treated as nothing
console.log(describe(''));        // 'value: ""'

console.log('\n--- NaN: the value that is never equal to anything, including itself ---');
console.log(NaN === NaN);              // false - NaN is never === to anything
console.log(NaN == NaN);               // false - coercion doesn't help here either
console.log(Number.isNaN(NaN));        // true - the only reliable way to check for NaN
console.log(Object.is(NaN, NaN));      // true - Object.is treats NaN as equal to itself
console.log(Object.is(0, -0));         // false - Object.is DOES distinguish signed zero
console.log(0 === -0);                 // true - === does NOT distinguish signed zero

console.log('\n--- Object-to-primitive coercion in == and + ---');
// When an object is compared with == against a primitive, or used with +,
// JS calls the object's valueOf()/toString() to get a primitive first.
const moneyBag = {
  amount: 5,
  valueOf() {
    return this.amount;
  },
};
console.log(moneyBag == 5);      // true - valueOf() is called, giving 5
console.log(moneyBag + 1);       // 6 - same coercion applies to +
console.log([] == '');           // true - [] -> '' via toString(), '' == '' -> true
console.log([] == false);        // true - [] -> '' -> 0, false -> 0, 0 == 0 -> true
console.log([1, 2] == '1,2');    // true - Array.toString() joins with commas

console.log('\n--- The real-world takeaway ---');
console.log(
  'Use === by default. Reach for `== null` on purpose as a readable null-or-' +
    'undefined check. Treat any OTHER use of == in a code review as a bug ' +
    "until proven otherwise - the coercion rules above are why."
);

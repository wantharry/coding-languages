'use strict';

/**
 * CURRYING AND FUNCTION COMPOSITION
 * ====================================
 *
 * Currying: transforming a function that takes multiple arguments into a
 * sequence of functions that each take a single argument (or a subset),
 * returning a new function until all arguments have been supplied.
 *
 * Composition: combining simple functions into a bigger one, where the
 * output of one becomes the input of the next - `compose(f, g)(x)` is
 * `f(g(x))`.
 *
 * Why this matters: these are the building blocks behind middleware
 * patterns (Redux/Express both chain functions together), partial
 * application (pre-filling some arguments of a reusable function, e.g.
 * a configured API client), and "point-free" style utility pipelines.
 * A senior interview will often ask you to implement a generic `curry`
 * function, not just use `.bind()` for partial application - this file
 * shows both.
 */

// --- Manual currying for a specific function --------------------------------
function add3(a, b, c) {
  return a + b + c;
}

function curriedAdd3(a) {
  return function (b) {
    return function (c) {
      return a + b + c;
    };
  };
}

console.log('--- Manual currying ---');
console.log(add3(1, 2, 3));        // 6
console.log(curriedAdd3(1)(2)(3)); // 6, same result, one argument at a time

// Currying enables reusable, partially-applied functions:
const add1 = curriedAdd3(1);
const add1And2 = add1(2);
console.log(add1And2(3)); // 6
console.log(add1(10)(10)); // 21

// --- A generic `curry` helper: works for any fixed-arity function ----------
//
// This is the version worth being able to write live: it inspects the
// target function's declared arity (fn.length) and keeps collecting
// arguments until it has enough, then calls the original function.
function curry(fn) {
  const arity = fn.length;

  return function curried(...args) {
    if (args.length >= arity) {
      return fn(...args);
    }
    // Not enough arguments yet: return a new function that remembers
    // (closes over) the arguments collected so far, waiting for more.
    return function (...nextArgs) {
      return curried(...args, ...nextArgs);
    };
  };
}

function multiply3(a, b, c) {
  return a * b * c;
}
const curriedMultiply = curry(multiply3);

console.log('\n--- Generic curry() helper ---');
console.log(curriedMultiply(2)(3)(4));     // 24 - one at a time
console.log(curriedMultiply(2, 3)(4));     // 24 - two then one
console.log(curriedMultiply(2, 3, 4));     // 24 - all at once, still works
console.log(curriedMultiply(2)(3, 4));     // 24 - one then two

// --- Real-world use: a pre-configured logger via partial application -----
function logWithLevel(level, timestamp, message) {
  return `[${level}] (${timestamp}) ${message}`;
}
const curriedLog = curry(logWithLevel);
const errorLogger = curriedLog('ERROR'); // "pre-fill" the level, reuse everywhere
console.log(errorLogger('12:00:00', 'Disk full'));
console.log(errorLogger('12:00:05', 'Connection refused'));

// --- Function composition ----------------------------------------------------
//
// compose runs functions RIGHT TO LEFT: compose(f, g, h)(x) = f(g(h(x))).
// pipe runs functions LEFT TO RIGHT, which usually reads more naturally
// for a data-processing pipeline.
function compose(...fns) {
  return function (initialValue) {
    return fns.reduceRight((value, fn) => fn(value), initialValue);
  };
}

function pipe(...fns) {
  return function (initialValue) {
    return fns.reduce((value, fn) => fn(value), initialValue);
  };
}

const trim = (s) => s.trim();
const toLowerCase = (s) => s.toLowerCase();
const removeSpaces = (s) => s.replace(/\s+/g, '-');

console.log('\n--- compose vs pipe ---');
const slugifyCompose = compose(removeSpaces, toLowerCase, trim);
// Reads inside-out: trim first, then toLowerCase, then removeSpaces -
// because compose applies the RIGHTMOST function first.
console.log(slugifyCompose('  Senior Engineer Interview  ')); // "senior-engineer-interview"

const slugifyPipe = pipe(trim, toLowerCase, removeSpaces);
// Reads left-to-right in the actual order of execution - usually clearer.
console.log(slugifyPipe('  Senior Engineer Interview  ')); // "senior-engineer-interview"

// --- A realistic composed validation/transform pipeline --------------------
const double = (n) => n * 2;
const increment = (n) => n + 1;
const square = (n) => n * n;

const transform = pipe(double, increment, square);
console.log('\n--- Numeric pipeline ---');
console.log(transform(3)); // double:6 -> increment:7 -> square:49

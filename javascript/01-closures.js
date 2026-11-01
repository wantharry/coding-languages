'use strict';

/**
 * CLOSURES
 * ========
 *
 * A closure is what happens when a function "remembers" the variables from
 * the scope it was DEFINED in, even after that outer scope has finished
 * running. The function carries a reference to its lexical environment
 * around with it, wherever it goes.
 *
 * Why this matters in real interviews:
 *   - It's the mechanism behind private state in JS (before `#private`
 *     class fields existed, and still widely used for module patterns,
 *     memoization caches, and factory functions).
 *   - It's also the #1 source of a classic bug: capturing a loop variable
 *     by reference instead of by value (see 11-var-let-const-hoisting.js
 *     for the canonical var/let version of that bug).
 *   - "Why doesn't my event handler see the updated value?" is almost
 *     always a closure question in disguise.
 */

// --- Example 1: Counter factory (private state via closure) ---------------
//
// `count` is NOT a global, and it's NOT a property on the returned object.
// It lives only inside the activation record of `createCounter`. The two
// inner functions close over that same `count` variable, so they share it,
// but nothing outside this function can reach it directly.
function createCounter(start = 0) {
  let count = start;

  return {
    increment() {
      count += 1;
      return count;
    },
    decrement() {
      count -= 1;
      return count;
    },
    value() {
      return count;
    },
  };
}

const counterA = createCounter();
const counterB = createCounter(100);

console.log('--- Counter factory ---');
console.log(counterA.increment()); // 1
console.log(counterA.increment()); // 2
console.log(counterB.increment()); // 101  <- independent closure, own `count`
console.log(counterA.value());     // 2    <- counterA and counterB never collide
// There is no `counterA.count` to poke at from outside:
console.log('counterA.count is', counterA.count); // undefined - truly private

// --- Example 2: Memoization (closures as a cache) ---------------------------
//
// This is the practical, real-world use senior interviews actually want to
// see: a closure holding a cache that persists across calls to the returned
// function, without polluting any outer/global scope.
function memoize(fn) {
  const cache = new Map();

  return function memoized(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

function slowSquare(n) {
  // Simulate expensive work.
  for (let i = 0; i < 1e6; i++) {
    /* burn cycles */
  }
  return n * n;
}

const fastSquare = memoize(slowSquare);

console.log('\n--- Memoization ---');
const t0 = Date.now();
console.log(fastSquare(12)); // 144, slow (cache miss)
const t1 = Date.now();
console.log(fastSquare(12)); // 144, fast (cache hit, read from closure's Map)
const t2 = Date.now();
console.log(`first call: ${t1 - t0}ms, cached call: ${t2 - t1}ms`);
console.log('Cached call should be ~0ms versus a measurable first call.');

// --- Example 3: The classic closure-in-a-loop trap, fixed with a factory --
//
// If you write a function INSIDE a loop and that function captures the
// loop's variable, every one of those functions shares the SAME variable
// (when using `var`) unless you force a new scope per iteration. A common
// fix (predating `let`) is exactly a closure: wrap the loop body in a
// function that takes the index as a parameter, creating a fresh binding
// per call. See 11-var-let-const-hoisting.js for the side-by-side var vs
// let demo with verified output.
function makeAdders() {
  const adders = [];
  for (var i = 0; i < 3; i++) {
    adders.push(
      (function (capturedI) {
        return function (x) {
          return x + capturedI;
        };
      })(i)
    );
  }
  return adders;
}

console.log('\n--- IIFE-captured adders (closure fixing a var-in-loop bug) ---');
const adders = makeAdders();
console.log(adders.map((fn) => fn(10))); // [10, 11, 12] - each remembers its own i

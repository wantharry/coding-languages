'use strict';

/**
 * `this` BINDING
 * ==============
 *
 * `this` in JavaScript is NOT determined by where a function is defined.
 * It's determined by HOW the function is CALLED. This is the single
 * biggest source of confusion for people coming from languages where
 * `this`/`self` is lexically bound to the enclosing class.
 *
 * The four rules, in increasing priority (later rules win):
 *   1. Default binding:    plain function call -> `this` is undefined in
 *                           strict mode (or globalThis in sloppy mode).
 *   2. Implicit binding:   `obj.method()` -> `this` is `obj`.
 *   3. Explicit binding:   `fn.call(obj)`, `fn.apply(obj)`, `fn.bind(obj)`.
 *   4. `new` binding:      `new Fn()` -> `this` is the newly created object.
 *   Arrow functions follow NONE of these rules: they have no `this` of
 *   their own at all. They capture `this` lexically from the enclosing
 *   scope, exactly like a closure captures a variable.
 *
 * Why this matters: callbacks. Every time you pass `obj.method` as a
 * callback (to setTimeout, addEventListener, Array methods, Promise
 * handlers), you detach it from `obj`, and the implicit-binding rule no
 * longer applies. This is THE classic real-world `this` bug.
 */

// --- Implicit binding -------------------------------------------------------
const user = {
  name: 'Ada',
  greet() {
    return `Hi, I'm ${this.name}`;
  },
};

console.log('--- Implicit binding ---');
console.log(user.greet()); // "Hi, I'm Ada" - this = user, because it was called as user.greet()

// --- Default binding (the detachment bug) -----------------------------------
const detachedGreet = user.greet; // just a reference to the function, no owner
console.log('\n--- Default binding (lost `this`) ---');
try {
  console.log(detachedGreet()); // this is undefined in strict mode -> TypeError
} catch (err) {
  console.log('Threw:', err.constructor.name, '-', err.message);
  // In strict mode: TypeError: Cannot read properties of undefined (reading 'name')
}

// --- Explicit binding: call / apply / bind ----------------------------------
function introduce(greeting, punctuation) {
  return `${greeting}, I'm ${this.name}${punctuation}`;
}

const ada = { name: 'Ada' };
const grace = { name: 'Grace' };

console.log('\n--- Explicit binding ---');
// call: invoke immediately, args passed individually
console.log(introduce.call(ada, 'Hello', '!'));      // "Hello, I'm Ada!"
// apply: invoke immediately, args passed as an array
console.log(introduce.apply(grace, ['Hey', '.']));   // "Hey, I'm Grace."
// bind: does NOT invoke; returns a new function permanently bound to `this`
const introduceAsAda = introduce.bind(ada);
console.log(introduceAsAda('Yo', '?'));              // "Yo, I'm Ada?"
// A bound function's `this` cannot be re-bound, even by another .call():
console.log(introduceAsAda.call(grace, 'Nope', '!')); // still "Nope, I'm Ada!"

// --- Arrow functions: no own `this` -----------------------------------------
//
// An arrow function does not create its own `this` binding. When the
// JS engine looks up `this` inside an arrow function, it keeps walking
// UP the lexical scope chain until it finds a regular function (or the
// top level) that owns a `this`, exactly like resolving a free variable.
const arrowUser = {
  name: 'Linus',
  // BAD: arrow as an object method. `this` here is NOT arrowUser; it's
  // whatever `this` is in the surrounding (module/top-level) scope.
  greetArrow: () => `Hi, I'm ${this && this.name}`,
  // GOOD: regular method, arrow INSIDE it to preserve `this` for a callback.
  greetAfterDelay(callback) {
    const self = this; // old-school workaround, shown for comparison
    setTimeout(() => {
      // this arrow captures `this` from greetAfterDelay's scope, which
      // IS arrowUser (because greetAfterDelay was called as arrowUser.method()).
      callback(`Hi, I'm ${this.name} (and self.name is ${self.name})`);
    }, 0);
  },
};

console.log('\n--- Arrow functions and `this` ---');
console.log(arrowUser.greetArrow()); // "Hi, I'm undefined" - this is NOT arrowUser

// --- The real-world bug: losing `this` in a callback ------------------------
//
// This is the bug every senior candidate should be able to spot and fix
// instantly: a method passed as a callback loses its receiver.
class Timer {
  constructor(label) {
    this.label = label;
    this.ticks = 0;
  }

  // BAD version (kept here only to demonstrate the failure path safely,
  // wrapped in try/catch so this file doesn't crash):
  tickBroken() {
    this.ticks += 1;
    return `${this.label}: ${this.ticks}`;
  }

  // GOOD fix #1: bind in the constructor.
  // GOOD fix #2 (used below): arrow function as a class field, which
  // captures `this` lexically at the point the instance is created.
  tickFixed = () => {
    this.ticks += 1;
    return `${this.label}: ${this.ticks}`;
  };
}

console.log('\n--- Real bug: method passed as a bare callback ---');
const timer = new Timer('build');

// Demonstrate the break: passing the unbound method to setTimeout-style API.
function runLater(fn) {
  // Simulates what setTimeout/addEventListener do internally: call the
  // function with no receiver, i.e. `fn()`, not `obj.fn()`.
  return fn();
}

try {
  console.log(runLater(timer.tickBroken)); // detached -> this.label throws
} catch (err) {
  console.log('tickBroken threw:', err.constructor.name, '- this was not `timer`');
}

// The fixed version works because the arrow-function class field already
// has `this` baked in at creation time, independent of how it's called.
console.log(runLater(timer.tickFixed)); // "build: 1" - works even detached
console.log(runLater(timer.tickFixed)); // "build: 2"

// Equivalent fix using .bind() instead of an arrow class field:
class TimerWithBind {
  constructor(label) {
    this.label = label;
    this.ticks = 0;
    this.tick = this.tick.bind(this); // rebind once, in the constructor
  }
  tick() {
    this.ticks += 1;
    return `${this.label}: ${this.ticks}`;
  }
}

const boundTimer = new TimerWithBind('deploy');
console.log(runLater(boundTimer.tick)); // "deploy: 1" - works detached too

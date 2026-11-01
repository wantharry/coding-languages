'use strict';

/**
 * GENERATORS AND ITERATORS
 * ===========================
 *
 * An ITERATOR is any object with a `.next()` method that returns
 * `{ value, done }`. An ITERABLE is any object with a `[Symbol.iterator]`
 * method that returns an iterator - that's the protocol `for...of`,
 * spread, and destructuring all rely on under the hood.
 *
 * A GENERATOR FUNCTION (`function*`) is a shortcut for building both at
 * once. Calling a generator function does NOT run its body - it returns
 * a generator object (which is both an iterator AND an iterable) frozen
 * at the very start. Each call to `.next()` runs the body UP TO the next
 * `yield`, then PAUSES there, handing back whatever was yielded. The
 * entire local state of the function (local variables, where it paused)
 * is preserved between calls - this is effectively "closures, but for
 * suspending and resuming a whole function body," which is why
 * generators are such a natural fit for lazy sequences and custom
 * iteration logic.
 *
 * Why this matters: generators are the mechanism `async/await` is
 * secretly built on top of (an async function is conceptually a
 * generator driven automatically by the engine, pausing/resuming at each
 * await instead of each yield). They're also how you make YOUR OWN
 * objects work with `for...of`, and how infinite/lazy sequences avoid
 * ever materializing an actual array.
 */

// --- A basic generator: yield pauses and hands back a value ---------------
function* basicGenerator() {
  console.log('  generator: about to yield 1');
  yield 1;
  console.log('  generator: resumed, about to yield 2');
  yield 2;
  console.log('  generator: resumed, about to return 3');
  return 3; // shows up as { value: 3, done: true }, NOT as another yielded value
}

console.log('--- Basic generator, step by step ---');
const gen = basicGenerator(); // body has NOT run yet
console.log('calling .next() #1:', gen.next()); // runs up to first yield -> { value: 1, done: false }
console.log('calling .next() #2:', gen.next()); // resumes, runs to second yield -> { value: 2, done: false }
console.log('calling .next() #3:', gen.next()); // resumes, hits return -> { value: 3, done: true }
console.log('calling .next() #4:', gen.next()); // already finished -> { value: undefined, done: true }

// --- Generators are iterable: for...of drives .next() automatically -------
function* colors() {
  yield 'red';
  yield 'green';
  yield 'blue';
}

console.log('\n--- for...of over a generator ---');
for (const color of colors()) {
  console.log(' color:', color);
}
// Spread works too, because generators implement the iterable protocol:
console.log([...colors()]); // ['red', 'green', 'blue']

// --- Passing values INTO a generator via .next(value) ----------------------
//
// `yield` is actually two-way: the value passed to .next() becomes the
// RESULT of the `yield` expression that's currently paused.
function* conversation() {
  const name = yield 'What is your name?';
  const favLang = yield `Nice to meet you, ${name}. What is your favorite language?`;
  return `${name} likes ${favLang}. Conversation over.`;
}

console.log('\n--- Two-way communication with .next(value) ---');
const convo = conversation();
console.log(convo.next());          // runs to first yield -> { value: 'What is your name?', done: false }
console.log(convo.next('Ada'));     // 'Ada' becomes the result of the first yield expression
console.log(convo.next('JavaScript')); // completes -> { value: '...', done: true }

// --- Infinite / lazy sequences: the real reason generators matter --------
//
// This generator never "finishes" on its own - it's an infinite sequence.
// Because generators are LAZY (each value is computed only when asked
// for), this is completely safe: we just take the first few manually.
function* naturalNumbers() {
  let n = 1;
  while (true) {
    yield n++;
  }
}

console.log('\n--- Infinite lazy generator, consumed carefully ---');
const nats = naturalNumbers();
const firstFive = [];
for (let i = 0; i < 5; i++) {
  firstFive.push(nats.next().value);
}
console.log(firstFive); // [1, 2, 3, 4, 5] - never built the "whole" infinite sequence

// --- Building a custom ITERABLE object (not a generator, by hand) ---------
//
// This shows the protocol generators are hiding from you: implementing
// Symbol.iterator yourself lets any object work with for...of/spread.
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  // Easiest real-world approach: implement Symbol.iterator with a generator
  // method. (You COULD hand-write a .next()-returning object instead, but
  // nobody does that by choice once generators exist.)
  *[Symbol.iterator]() {
    for (let n = this.start; n <= this.end; n++) {
      yield n;
    }
  }
}

console.log('\n--- Custom iterable class, powered by a generator method ---');
const range = new Range(5, 8);
console.log([...range]);          // [5, 6, 7, 8] - spread works because of Symbol.iterator
for (const n of range) {
  console.log(' range value:', n);
}

// --- yield* delegates to another iterable -----------------------------------
function* inner() {
  yield 'a';
  yield 'b';
}
function* outer() {
  yield 1;
  yield* inner(); // delegates: yields everything `inner()` yields, in order
  yield 2;
}
console.log('\n--- yield* delegation ---');
console.log([...outer()]); // [1, 'a', 'b', 2]

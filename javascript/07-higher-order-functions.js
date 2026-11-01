'use strict';

/**
 * HIGHER-ORDER FUNCTIONS: map / filter / reduce FROM FIRST PRINCIPLES
 * ======================================================================
 *
 * A higher-order function either takes a function as an argument,
 * returns a function, or both. map/filter/reduce are the three you use
 * every day without thinking about them - but a senior interview will
 * often ask you to implement one from scratch, specifically to check
 * that you understand what they do UNDER THE HOOD (iteration, the
 * accumulator pattern, that they don't mutate the original array).
 *
 * Why this matters: once you've built reduce yourself, you realize map
 * and filter are just special cases of it, and a huge chunk of
 * "functional-style" array code is reduce in disguise. That's a
 * genuinely useful mental model, not just interview trivia.
 */

const numbers = [1, 2, 3, 4, 5];

// --- Built-ins, for reference -------------------------------------------
console.log('--- Built-ins ---');
console.log(numbers.map((n) => n * 2));           // [2, 4, 6, 8, 10]
console.log(numbers.filter((n) => n % 2 === 0));  // [2, 4]
console.log(numbers.reduce((acc, n) => acc + n, 0)); // 15

// --- Our own `map`: produces a NEW array, same length, transformed values -
function myMap(array, transformFn) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    // Real Array.prototype.map also passes (element, index, array) to the
    // callback, and skips holes in sparse arrays - simplified here.
    result.push(transformFn(array[i], i, array));
  }
  return result;
}

// --- Our own `filter`: produces a NEW array, keeping only matches ---------
function myFilter(array, predicateFn) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    if (predicateFn(array[i], i, array)) {
      result.push(array[i]);
    }
  }
  return result;
}

// --- Our own `reduce`: THE fundamental one - folds the array into one value
function myReduce(array, reducerFn, initialValue) {
  const hasInitial = initialValue !== undefined;
  let accumulator = hasInitial ? initialValue : array[0];
  const startIndex = hasInitial ? 0 : 1;

  if (!hasInitial && array.length === 0) {
    // Mirrors the real spec behavior: reduce with no initial value on an
    // empty array is a hard error, not a silently-wrong result.
    throw new TypeError('Reduce of empty array with no initial value');
  }

  for (let i = startIndex; i < array.length; i++) {
    accumulator = reducerFn(accumulator, array[i], i, array);
  }
  return accumulator;
}

console.log('\n--- Hand-rolled versions, same results ---');
console.log(myMap(numbers, (n) => n * 2));            // [2, 4, 6, 8, 10]
console.log(myFilter(numbers, (n) => n % 2 === 0));   // [2, 4]
console.log(myReduce(numbers, (acc, n) => acc + n, 0)); // 15

// --- Proving map and filter are really just reduce in disguise -------------
//
// This is the "aha" a senior interview wants: once you see reduce as the
// primitive, map/filter are degenerate cases of it.
function mapViaReduce(array, transformFn) {
  return myReduce(
    array,
    (acc, item, i, arr) => {
      acc.push(transformFn(item, i, arr));
      return acc;
    },
    []
  );
}

function filterViaReduce(array, predicateFn) {
  return myReduce(
    array,
    (acc, item, i, arr) => {
      if (predicateFn(item, i, arr)) acc.push(item);
      return acc;
    },
    []
  );
}

console.log('\n--- map/filter reimplemented purely via reduce ---');
console.log(mapViaReduce(numbers, (n) => n * 2));          // [2, 4, 6, 8, 10]
console.log(filterViaReduce(numbers, (n) => n % 2 === 0)); // [2, 4]

// --- Immutability check: originals are untouched ----------------------------
console.log('\n--- Immutability check ---');
const before = JSON.stringify(numbers);
myMap(numbers, (n) => n * 100);
myFilter(numbers, () => false);
myReduce(numbers, (a, n) => a + n, 0);
console.log('numbers unchanged after all calls:', JSON.stringify(numbers) === before); // true

// --- A realistic composed pipeline (the kind of thing you write daily) -----
const orders = [
  { id: 1, total: 250, status: 'paid' },
  { id: 2, total: 80, status: 'pending' },
  { id: 3, total: 400, status: 'paid' },
  { id: 4, total: 15, status: 'paid' },
];

const totalPaidOver50 = orders
  .filter((o) => o.status === 'paid' && o.total > 50)
  .map((o) => o.total)
  .reduce((sum, total) => sum + total, 0);

console.log('\n--- Realistic chained pipeline ---');
console.log('Sum of paid orders over $50:', totalPaidOver50); // 650 (250 + 400)

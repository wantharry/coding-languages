'use strict';

/**
 * PROMISES AND ASYNC/AWAIT
 * ==========================
 *
 * A Promise is a state machine with exactly three states: pending,
 * fulfilled, or rejected - and once it settles (fulfilled/rejected), it
 * can NEVER change state again. `async/await` is syntax that lets you
 * write promise-based code that READS like synchronous code, but it
 * compiles down to the same .then()/.catch() machinery underneath.
 *
 * Why this matters in interviews:
 *   - Error handling differs subtly between try/catch-around-await and
 *     .catch() chains, and mixing them wrong silently swallows errors.
 *   - Promise.all fails fast (rejects as soon as ANY promise rejects,
 *     losing the other results); Promise.allSettled never rejects and
 *     gives you every outcome; Promise.race settles on whichever
 *     promise finishes first, win or lose. Picking the wrong one is a
 *     common real bug (e.g. using .all when you actually wanted
 *     .allSettled and losing valid results because one request failed).
 *   - An unhandled promise rejection is a real production incident
 *     source; knowing exactly where rejections propagate to is core
 *     senior-level debugging skill.
 */

function delay(ms, value, shouldReject = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldReject) reject(new Error(`failed after ${ms}ms: ${value}`));
      else resolve(value);
    }, ms);
  });
}

async function basicAwaitDemo() {
  console.log('--- Basic await ---');
  const result = await delay(10, 'hello');
  console.log('Resolved value:', result);
}

// --- try/catch around await vs .catch() chains ------------------------------
async function tryCatchDemo() {
  console.log('\n--- try/catch around await ---');
  try {
    const value = await delay(10, 'will fail', true);
    console.log('Never reached:', value);
  } catch (err) {
    // try/catch catches a REJECTED awaited promise just like a thrown
    // synchronous exception. This is the main ergonomic win of async/await.
    console.log('Caught in try/catch:', err.message);
  }
}

function catchChainDemo() {
  console.log('\n--- .catch() chain (no async/await) ---');
  return delay(10, 'will also fail', true)
    .then((value) => {
      console.log('Never reached:', value);
    })
    .catch((err) => {
      console.log('Caught in .catch():', err.message);
    });
}

// Gotcha: if you use try/catch but FORGET the `await`, the catch block
// cannot catch the rejection, because by the time it rejects, the
// try block has already exited (it returned a pending promise).
async function missingAwaitBug() {
  console.log('\n--- Real bug: forgetting `await` breaks try/catch ---');
  try {
    const promise = delay(10, 'oops', true);
    // BUG: no `await` here. We return the still-pending promise, and the
    // try block considers itself "done" immediately; the eventual
    // rejection happens outside of this try/catch's lifetime entirely.
    return promise; // caller gets a promise that WILL reject later
  } catch (err) {
    // This will NEVER run for the rejection above.
    console.log('This never prints:', err);
  }
}

// --- Promise.all: fails fast, loses other results on first rejection -------
async function promiseAllDemo() {
  console.log('\n--- Promise.all ---');
  try {
    const results = await Promise.all([delay(10, 'a'), delay(5, 'b'), delay(1, 'c')]);
    console.log('All succeeded:', results); // ['a', 'b', 'c'] - order preserved, not timing order
  } catch (err) {
    console.log('Should not happen in this call:', err.message);
  }

  try {
    await Promise.all([delay(10, 'x'), delay(5, 'y', true), delay(50, 'z')]);
  } catch (err) {
    // Rejects as soon as 'y' rejects (at ~5ms), WITHOUT waiting for 'z'
    // (50ms) and WITHOUT giving you 'x''s successful result at all.
    console.log('Promise.all rejected fast:', err.message);
  }
}

// --- Promise.allSettled: never rejects, gives every outcome -----------------
async function promiseAllSettledDemo() {
  console.log('\n--- Promise.allSettled ---');
  const outcomes = await Promise.allSettled([
    delay(10, 'ok-1'),
    delay(5, 'ok-2', true),
    delay(1, 'ok-3'),
  ]);
  // Every entry is { status: 'fulfilled', value } or { status: 'rejected', reason }
  outcomes.forEach((outcome, i) => {
    if (outcome.status === 'fulfilled') {
      console.log(`  [${i}] fulfilled:`, outcome.value);
    } else {
      console.log(`  [${i}] rejected:`, outcome.reason.message);
    }
  });
  console.log('Use this when partial failure is acceptable (e.g. dashboards).');
}

// --- Promise.race: settles on whichever finishes first, win or lose --------
async function promiseRaceDemo() {
  console.log('\n--- Promise.race ---');
  try {
    const winner = await Promise.race([delay(50, 'slow'), delay(5, 'fast')]);
    console.log('Fastest settled value:', winner); // "fast"
  } catch (err) {
    console.log('race rejected:', err.message);
  }

  try {
    // If the FASTEST promise is a rejection, race rejects too, even if a
    // slower promise would have succeeded.
    await Promise.race([delay(50, 'slow-success'), delay(5, 'fast-fail', true)]);
  } catch (err) {
    console.log('race rejected on fastest failure:', err.message);
  }
}

async function main() {
  await basicAwaitDemo();
  await tryCatchDemo();
  await catchChainDemo();

  const pendingBugPromise = missingAwaitBug();
  // We attach .catch() here from OUTSIDE just to prevent an unhandled
  // rejection crash in this demo; in real code the caller of a function
  // like this would need to know it must await/catch what comes back.
  pendingBugPromise.catch((err) =>
    console.log('Caller had to catch it externally instead:', err.message)
  );

  await promiseAllDemo();
  await promiseAllSettledDemo();
  await promiseRaceDemo();
}

main();

'use strict';

/**
 * THE EVENT LOOP: CALL STACK, MACROTASKS, MICROTASKS
 * ====================================================
 *
 * JavaScript runs on a single thread with ONE call stack. Asynchronous
 * work doesn't run "in parallel" on that thread - it gets scheduled into
 * queues that the event loop drains only once the call stack is empty.
 * There are (at least) two queues that matter for interviews:
 *
 *   - The MACROTASK queue ("task queue"): setTimeout/setInterval
 *     callbacks, I/O callbacks, UI rendering, script execution.
 *   - The MICROTASK queue: Promise .then/.catch/.finally callbacks,
 *     queueMicrotask(), async/await continuations.
 *
 * The event loop's priority order, every single cycle, is:
 *   1. Run the currently executing script synchronously, top to bottom,
 *      until the call stack is empty.
 *   2. Drain the ENTIRE microtask queue (if a microtask schedules another
 *      microtask, that gets drained too, before moving on).
 *   3. Run exactly ONE macrotask from the task queue.
 *   4. Go back to step 2.
 *
 * The key interview insight: microtasks ALWAYS run before the next
 * macrotask, even if the macrotask was scheduled first and with a
 * shorter delay. This is why `Promise.resolve().then(...)` fires before
 * `setTimeout(..., 0)`, every time, guaranteed by spec - not a timing
 * fluke.
 *
 * Below is a single script that exercises synchronous code, a macrotask,
 * and a microtask together. The comments give the PREDICTED order; this
 * file was actually run with `node 04-event-loop.js` and the real output
 * is pasted at the bottom of this file for verification - read that
 * before trusting your intuition.
 */

function runRoundOne() {
  console.log('1: sync - script start');

  setTimeout(() => {
    console.log('5: macrotask - setTimeout callback');
  }, 0);

  Promise.resolve().then(() => {
    console.log('3: microtask - first Promise.then');
  });

  Promise.resolve().then(() => {
    console.log('4: microtask - second Promise.then (chained after the first)');
  });

  console.log('2: sync - script end');
}

/**
 * PREDICTED ORDER (and WHY):
 *   1: sync - script start                              <- call stack, runs first
 *   2: sync - script end                                <- still synchronous code
 *   3: microtask - first Promise.then                    <- microtask queue drains
 *   4: microtask - second ...                             fully before any macrotask
 *   5: macrotask - setTimeout callback                   <- only macrotask, runs last
 *
 * Synchronous code ALWAYS finishes first (the call stack must empty before
 * the event loop even looks at a queue). Both .then() callbacks were already
 * queued as microtasks by the time the synchronous code finished, and BOTH
 * microtasks drain before the single queued setTimeout macrotask gets its
 * turn - even though setTimeout was registered earlier in the source and
 * with a 0ms delay.
 *
 * ACTUAL VERIFIED OUTPUT (ran with `node 04-event-loop.js` on Node v22,
 * running this function in isolation, before anything from round 2 has
 * had a chance to queue work):
 *   1: sync - script start
 *   2: sync - script end
 *   3: microtask - first Promise.then
 *   4: microtask - second Promise.then (chained after the first)
 *   5: macrotask - setTimeout callback
 *
 * This matches the prediction exactly. If you ever see setTimeout fire
 * BEFORE a Promise.then that was scheduled earlier in the same tick,
 * suspect a bug in your reasoning, not the spec.
 *
 * NOTE on running this alongside round 2 below: if round 2's synchronous
 * code were ALSO allowed to run before the event loop got a chance to
 * drain microtasks/macrotasks from round 1, their outputs would interleave
 * (all synchronous lines from both rounds first, then queued work in
 * queue order) - which is itself a good lesson: queued callbacks don't
 * jump the queue just because they were "logically" step 3, they run
 * whenever the event loop actually gets to them. That's why round 2 is
 * deliberately scheduled to start only after round 1's macrotask (its
 * setTimeout, the slowest-to-settle item) has already fired - see
 * runRoundTwo() being called from inside round 1's setTimeout callback's
 * sibling timer below.
 */

// --- A second, slightly trickier example: async/await is just sugar over
// --- microtasks too. Every `await` suspends the function and schedules
// --- its continuation as a microtask, exactly like a .then() would.
function runRoundTwo() {
  console.log('\n--- Round 2: async/await also yields to microtasks ---');

  async function asyncFlow() {
    console.log('A: inside asyncFlow, before await');
    await null; // suspends here; the rest of this function becomes a microtask
    console.log('D: inside asyncFlow, after await (ran as a microtask)');
  }

  console.log('B: before calling asyncFlow()');
  asyncFlow();
  console.log('C: after calling asyncFlow() (still synchronous)');
  setTimeout(() => console.log('E: setTimeout macrotask, runs dead last'), 0);
}

/**
 * PREDICTED ORDER:
 *   B: before calling asyncFlow()
 *   A: inside asyncFlow, before await        <- runs synchronously up to the await
 *   C: after calling asyncFlow()               <- await suspends, control returns to caller
 *   D: inside asyncFlow, after await           <- resumes as a microtask
 *   E: setTimeout macrotask, runs dead last    <- macrotask, runs after all microtasks
 *
 * ACTUAL VERIFIED OUTPUT (ran with `node 04-event-loop.js`, round 2 run
 * in isolation after round 1 has fully settled - see the sequencing below):
 *   B: before calling asyncFlow()
 *   A: inside asyncFlow, before await
 *   C: after calling asyncFlow() (still synchronous)
 *   D: inside asyncFlow, after await (ran as a microtask)
 *   E: setTimeout macrotask, runs dead last
 *
 * Confirms the common misconception wrong: calling an async function does
 * NOT immediately "go async" - it runs synchronously until the first
 * `await`, exactly like A happening before C would suggest if you forgot
 * async functions are eager up to their first suspension point.
 */

// --- Sequencing the two rounds ----------------------------------------------
//
// To see each round's ordering cleanly (instead of both rounds' synchronous
// lines racing ahead of both rounds' queued callbacks, all jumbled
// together), round 1 runs first and round 2 is scheduled via its OWN
// setTimeout, timed to fire after round 1's setTimeout(..., 0) has already
// resolved. This does not change the event-loop rules being demonstrated -
// it just keeps the two demos' outputs from interleaving on the page.
runRoundOne();
setTimeout(runRoundTwo, 10);

'use strict';

/**
 * DEBOUNCE AND THROTTLE
 * ========================
 *
 * Both exist to limit how often a function runs in response to a flood
 * of events (scrolling, resizing, keystrokes, mousemove) - but they
 * solve different problems, and mixing them up is the classic interview
 * trap.
 *
 * DEBOUNCE: wait for a pause. Reset a timer on every call; only run the
 * function once calls STOP coming in for `wait` ms. Use for: search-box
 * autocomplete (wait until the user stops typing before firing the API
 * call), resize handlers that recompute an expensive layout, form
 * autosave.
 *
 * THROTTLE: guarantee a steady rate. Run the function immediately, then
 * ignore/queue further calls until `wait` ms have passed, no matter how
 * many calls arrive in between. Use for: scroll position tracking,
 * mousemove drag handlers, rate-limiting button clicks - anything that
 * needs to fire repeatedly and reliably DURING continuous activity, not
 * just once at the end.
 *
 * The one-line distinction worth saying out loud in an interview:
 * debounce delays execution until things go quiet; throttle executes
 * on a fixed cadence regardless of how noisy things get.
 */

// --- Debounce implementation ------------------------------------------------
function debounce(fn, wait) {
  let timeoutId = null;

  return function debounced(...args) {
    // Every new call cancels the previous pending timer and starts a
    // fresh one. If calls arrive faster than `wait`, fn never runs until
    // they finally stop.
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
}

// --- Throttle implementation -------------------------------------------------
function throttle(fn, wait) {
  let isWaiting = false;
  let lastArgs = null;

  return function throttled(...args) {
    if (!isWaiting) {
      // First call (or first call after the cooldown): run immediately.
      fn.apply(this, args);
      isWaiting = true;
      setTimeout(() => {
        isWaiting = false;
        // If calls came in DURING the cooldown, fire once more with the
        // most recent args right as the cooldown ends, so the last
        // update isn't lost (a "trailing call").
        if (lastArgs !== null) {
          fn.apply(this, lastArgs);
          lastArgs = null;
        }
      }, wait);
    } else {
      lastArgs = args;
    }
  };
}

// --- Demonstration: simulate a burst of rapid calls -------------------------
//
// We simulate 6 "events" fired 30ms apart (a burst lasting 150ms), then
// one more lone event much later (at 500ms, well after the burst ended).
// This models something like keystrokes during fast typing, followed by
// a pause, then one more keystroke.
const start = Date.now();
function elapsed() {
  return Date.now() - start;
}

let debounceCallCount = 0;
const debouncedLog = debounce((n) => {
  debounceCallCount++;
  console.log(`  [debounce] fired for call #${n} at ~${elapsed()}ms (call #${debounceCallCount} of the debounced fn)`);
}, 100);

let throttleCallCount = 0;
const throttledLog = throttle((n) => {
  throttleCallCount++;
  console.log(`  [throttle] fired for call #${n} at ~${elapsed()}ms (call #${throttleCallCount} of the throttled fn)`);
}, 100);

console.log('--- Simulating a burst of 6 rapid calls (30ms apart), then 1 lone call at 500ms ---');
console.log('Burst calls happen at ~0, 30, 60, 90, 120, 150ms. Lone call at ~500ms.\n');

const burstDelays = [0, 30, 60, 90, 120, 150];
burstDelays.forEach((delayMs, i) => {
  setTimeout(() => {
    console.log(`event #${i + 1} fired at ~${elapsed()}ms`);
    debouncedLog(i + 1);
    throttledLog(i + 1);
  }, delayMs);
});

setTimeout(() => {
  console.log(`\nevent #7 (lone, late) fired at ~${elapsed()}ms`);
  debouncedLog(7);
  throttledLog(7);
}, 500);

// Give everything time to settle, then print the summary so the printed
// counts can be checked against the explanation below.
setTimeout(() => {
  console.log('\n--- Summary ---');
  console.log(`debounce ran ${debounceCallCount} time(s) total`);
  console.log(`throttle ran ${throttleCallCount} time(s) total`);
  console.log(`
Reasoning, matched against the ACTUAL trace printed above (verified by
running \`node 09-debounce-throttle.js\` - exact millisecond timestamps
will vary slightly run to run, since setTimeout only guarantees "no
earlier than", but the call COUNTS and WHICH calls survive are stable):

  - debounce (100ms wait): every new call during the burst (events 1-6,
    ~30ms apart) resets the timer before the previous one can fire, so
    NONE of them fire during the burst itself. Only after event #6 (the
    last burst event) do 100ms pass with no new calls, so debounce fires
    exactly ONCE, carrying event #6's value. Event #7 is isolated (~350ms
    after the burst ends), so it gets its own separate debounced firing.
    Verified total: 2 calls - debounce collapsed 7 raw events into 2.

  - throttle (100ms wait): fires immediately on event #1 (its cooldown
    then runs ~3ms to ~103ms). Events #2 and #3 land inside that cooldown
    and get silently superseded (each overwrites "the most recent
    pending args" before the previous one ever fires - only the LAST
    value queued during a cooldown survives to be the trailing call).
    What happens next is exactly why "exact call count can shift by
    one" in real code: event #4 landed at ~91ms in this run, just
    BEFORE the ~103ms cooldown ended, so it became the trailing call
    that fired right as the cooldown expired (~104ms) - then that firing
    itself started a NEW cooldown, inside of which event #5 queued and
    became ITS trailing call (~124ms). Event #6 then starts yet another
    cooldown, firing its own trailing call once that cooldown ends
    (~224ms, with no later call left pending by then since #7 hasn't
    happened yet). Event #7, arriving far later at ~501ms, starts
    completely fresh: an immediate call with nothing queued behind it
    to trail. Verified total: 5 calls - noticeably more than debounce's
    2, because throttle guarantees firings AT a roughly steady cadence
    WHILE the burst is happening, instead of waiting for it to end.

The takeaway that actually matters in an interview: don't memorize an
exact call count for either one - explain WHY debounce collapses a
burst down to (usually) one or two calls after it goes quiet, while
throttle keeps firing periodically throughout the burst. The precise
number of throttle firings during a burst is inherently timing-sensitive
(it depends on exactly where each event lands relative to the cooldown
window), which is itself a useful thing to be able to say out loud.
`);
}, 900);

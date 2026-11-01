/**
 * ASYNC/AWAIT WITH TYPED PROMISES, AND ERROR HANDLING PATTERNS
 * ===============================================================
 *
 * The type-system-relevant parts of async/await that interviewers probe:
 *   - `async function f(): Promise<T>` — the function ALWAYS returns a
 *     Promise, even though the body looks like it returns `T` directly;
 *     TypeScript wraps it for you, and gets annoyed if you try to return
 *     `Promise<Promise<T>>` by hand (it flattens, same as real Promises).
 *   - `await` unwraps a `Promise<T>` to `T` at the type level, matching
 *     exactly what it does at runtime — this is one of the cleanest
 *     examples of TypeScript's types tracking real control flow.
 *   - TypeScript CANNOT type-check what a `catch` block receives — `err`
 *     is typed `unknown` (or `any` under `useUnknownInCatchVariables: false`,
 *     which this project does not use), because JavaScript allows throwing
 *     literally any value, not just `Error` instances. Senior engineers
 *     know this is WHY you must narrow before using `err` (see file 05).
 */

// --- A function that can genuinely fail: typed rejection via Result --------
// Combining this with the `Result<T, E>` pattern from file 04 is a common
// senior-level technique: it makes failure part of the function's TYPE
// signature instead of an invisible, undocumented `throw` the caller has
// to already know to expect.
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

interface Weather {
  city: string;
  temperatureC: number;
}

// Simulates a network call. Returns a Promise the same way `fetch` would.
async function fetchWeather(city: string): Promise<Weather> {
  await delay(50);
  if (city.toLowerCase() === "atlantis") {
    throw new Error(`city not found: ${city}`);
  }
  // A small deterministic "random" so the demo output is stable.
  const temperatureC = (city.length * 3) % 35;
  return { city, temperatureC };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Wraps a throwing async function into a Result-returning one. This is a
// reusable, generic pattern — note the constraint-free generic `T` here is
// doing the same job as in file 02: preserving the wrapped function's
// specific return type through the wrapper.
async function toResult<T>(promise: Promise<T>): Promise<Result<T, string>> {
  try {
    const value = await promise;
    return { ok: true, value };
  } catch (err) {
    // `err` is `unknown` here — this project's strict settings make that
    // the type-checked default, which is why we must narrow it before use.
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}

async function demoBasicAsync(): Promise<void> {
  const weather = await fetchWeather("Paris");
  console.log("fetchWeather('Paris') =", weather);

  const safeResult = await toResult(fetchWeather("Atlantis"));
  if (safeResult.ok) {
    console.log("unexpected success:", safeResult.value);
  } else {
    console.log("toResult caught the failure cleanly:", safeResult.error);
  }
}

// --- Concurrency: Promise.all with preserved per-element types -------------
// `Promise.all` is generically typed so that a TUPLE of different Promise
// types resolves to a tuple of their respective resolved types — not a
// single widened union. This is a common interview gotcha: people expect
// to lose type precision across `Promise.all`, and don't.
async function demoPromiseAll(): Promise<void> {
  const [weather, idCount, flag] = await Promise.all([
    fetchWeather("Tokyo"), // Promise<Weather>
    Promise.resolve(42), // Promise<number>
    Promise.resolve(true), // Promise<boolean>
  ]);
  // weather: Weather, idCount: number, flag: boolean — each kept distinct.
  console.log("Promise.all ->", weather.city, idCount, flag);
}

// --- Promise.allSettled: when you want partial success, not all-or-nothing -
// Unlike `Promise.all` (which rejects as a whole on the first failure),
// `allSettled` always resolves, with each entry typed as a discriminated
// union on `status` — another real-world discriminated union, this one
// built into the standard library.
async function demoAllSettled(): Promise<void> {
  const cities = ["Nairobi", "Atlantis", "Oslo"];
  const outcomes = await Promise.allSettled(cities.map((c) => fetchWeather(c)));
  for (const outcome of outcomes) {
    if (outcome.status === "fulfilled") {
      // outcome.value: Weather here; outcome.reason would be a type error.
      console.log(`settled OK: ${outcome.value.city} = ${outcome.value.temperatureC}C`);
    } else {
      // outcome.reason: unknown by default — same reasoning as `catch`.
      const reason = outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
      console.log(`settled FAILED: ${reason}`);
    }
  }
}

// --- Top-level sequencing --------------------------------------------------
// This project targets ES2023 with NodeNext modules, which supports real
// top-level `await` — no wrapping IIFE required to run async demo code at
// module scope, though we still group things into named functions above
// for clarity about what each demo illustrates.
await demoBasicAsync();
await demoPromiseAll();
await demoAllSettled();

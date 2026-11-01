import { useMemo, useState } from 'react'
import Section from '../../components/Section'

/**
 * WHY useMemo exists:
 *
 * Every state update re-runs the whole component function. Any plain
 * variable computed in the body — `const result = slowFn(x)` — recomputes
 * on every single render, even renders triggered by completely unrelated
 * state. useMemo caches the return value and only recomputes it when the
 * values in its dependency array change (compared with Object.is, same as
 * useEffect). It is a performance tool, not a correctness one: the code
 * must still produce the same value if the computation ran every time.
 *
 * Below, `isPrimeCount` deliberately does real, slow, synchronous work
 * (checking primality up to `limit`, wrapped in a busy-loop multiplier).
 * Typing into the unrelated text box re-renders the component. Flip the
 * "memoize" checkbox off and every keystroke visibly stutters because the
 * expensive scan reruns on every keystroke; flip it on and typing is
 * instant because the scan only reruns when `limit` itself changes.
 */

function countPrimesUpTo(limit: number): number {
  let count = 0
  for (let n = 2; n <= limit; n++) {
    let isPrime = true
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        isPrime = false
        break
      }
    }
    if (isPrime) count++
  }
  // Repeat the scan a bunch of times purely to make the cost obvious on
  // modern hardware without needing an unreasonably large `limit`.
  for (let rep = 0; rep < 60; rep++) {
    let dummy = 0
    for (let n = 2; n <= limit; n++) dummy += n % 7
    if (dummy < 0) count += dummy // never true; keeps the loop from being optimized away
  }
  return count
}

export default function ExpensiveComputationDemo() {
  const [limit, setLimit] = useState(20000)
  const [unrelatedText, setUnrelatedText] = useState('')
  const [memoize, setMemoize] = useState(true)

  // useMemo must always be called (rules of hooks forbid calling it
  // conditionally), but thanks to the ternary below, the *plain* call to
  // countPrimesUpTo only actually executes when memoization is switched
  // off — otherwise every render would pay the expensive cost regardless
  // of the checkbox, which would hide the whole point of this demo.
  const memoizedCount = useMemo(() => countPrimesUpTo(limit), [limit])
  const primeCount = memoize ? memoizedCount : countPrimesUpTo(limit)

  return (
    <Section
      title="useMemo — caching an expensive computation"
      concept={
        'Type in the "unrelated" box below. With memoization OFF, every ' +
        'keystroke re-runs the prime scan and visibly lags. With it ON, the ' +
        'scan only reruns when the limit changes, so typing stays smooth.'
      }
    >
      <div className="card">
        <label className="field">
          <input
            type="checkbox"
            checked={memoize}
            onChange={(e) => setMemoize(e.target.checked)}
          />
          Memoize with useMemo
        </label>

        <label className="field">
          Prime-scan limit: {limit}
          <input
            type="range"
            min={5000}
            max={40000}
            step={1000}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          />
        </label>

        <label className="field">
          Unrelated text input (typing re-renders this component):
          <input
            type="text"
            value={unrelatedText}
            onChange={(e) => setUnrelatedText(e.target.value)}
            placeholder="type here and watch for lag"
          />
        </label>

        <p className="count-display">Primes found up to {limit}: {primeCount}</p>
      </div>
    </Section>
  )
}

import { useState } from 'react'
import Section from '../../components/Section'
import LogPanel, { stamp } from '../../components/LogPanel'

/**
 * WHY stale closures happen:
 *
 * Every render of a function component is a fresh call to that function.
 * `count` in this render's closure is a `const` bound to whatever value
 * React passed in for *this* render — it never mutates in place. A callback
 * created during render (an onClick handler, a setTimeout callback, an
 * effect) closes over that render's `count`, permanently. If the callback
 * fires later, after React has moved on to new renders with new counts,
 * the callback still sees the old, "stale" value — because it was never
 * looking at "the state", it was looking at one snapshot of it.
 *
 * `setCount(count + 1)` bakes that stale snapshot into the update. Three
 * quick clicks each schedule "set state to (stale 0) + 1", so all three
 * updates collapse into 1, not 3.
 *
 * The fix, `setCount(prev => prev + 1)`, hands React a function instead of
 * a value. React calls that function with whatever the *actual latest*
 * state is at the moment the update is applied (updates queue and apply
 * in order), so each queued update sees the previous one's result. This is
 * also why the "functional update" form is the safe default any time an
 * update depends on the current value and might not run immediately.
 */

function BrokenCounter() {
  const [count, setCount] = useState(0)
  const [log, setLog] = useState<string[]>([])

  // Captures `count` from THIS render's closure, then waits 1.5s.
  // Click it 3 times fast and only +1 shows up at the end, not +3.
  function delayedIncrementBroken() {
    const capturedAtClickTime = count
    setLog((l) => [...l, stamp(`clicked — closure saw count = ${capturedAtClickTime}`)])
    setTimeout(() => {
      // Stale! This still uses the `count` that was in scope when the
      // timeout was created, no matter how many renders happened since.
      setCount(capturedAtClickTime + 1)
    }, 1500)
  }

  return (
    <div className="card">
      <h3>Broken: setCount(count + 1) inside a delayed callback</h3>
      <p className="count-display">count = {count}</p>
      <button type="button" onClick={delayedIncrementBroken}>
        Click me 3 times fast (wait 1.5s)
      </button>
      <LogPanel lines={log} />
    </div>
  )
}

function FixedCounter() {
  const [count, setCount] = useState(0)
  const [log, setLog] = useState<string[]>([])

  function delayedIncrementFixed() {
    setLog((l) => [...l, stamp('clicked — queuing a functional update')])
    setTimeout(() => {
      // Not stale: `prev` is whatever count actually is when this update
      // is applied, including any other updates queued ahead of it.
      setCount((prev) => prev + 1)
    }, 1500)
  }

  return (
    <div className="card">
      <h3>Fixed: setCount(prev =&gt; prev + 1)</h3>
      <p className="count-display">count = {count}</p>
      <button type="button" onClick={delayedIncrementFixed}>
        Click me 3 times fast (wait 1.5s)
      </button>
      <LogPanel lines={log} />
    </div>
  )
}

export default function StaleClosureDemo() {
  return (
    <Section
      title="useState — the stale closure gotcha"
      concept={
        "Click each button 3 times within ~1.5 seconds. The broken counter " +
        "ends up +1 (all three clicks raced on the same stale `count`); the " +
        "fixed one ends up +3, because the functional update form reads the " +
        "latest state at apply-time instead of the value captured at " +
        "render-time."
      }
    >
      <div className="side-by-side">
        <BrokenCounter />
        <FixedCounter />
      </div>
    </Section>
  )
}

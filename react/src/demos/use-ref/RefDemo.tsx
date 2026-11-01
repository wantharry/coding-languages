import { useEffect, useRef, useState } from 'react'
import Section from '../../components/Section'

/**
 * WHY useRef exists, and why it's really two unrelated features sharing
 * one API:
 *
 * 1. DOM access: React normally owns the DOM — you describe what it should
 *    look like, and it handles creating/updating the actual nodes. Some
 *    things (focus(), measuring size, scrolling, integrating a non-React
 *    widget) require the real node itself. Passing a ref to an element
 *    makes React stash that node on `ref.current` after it mounts.
 *
 * 2. A mutable box that survives re-renders but, unlike useState, changing
 *    `.current` does NOT trigger a re-render. useState's whole job is "tell
 *    React to redraw when this changes." Sometimes you want the opposite:
 *    a value that needs to persist across renders (a timer id, a previous
 *    value, a flag) purely for logic's sake, with the UI following it only
 *    indirectly or not at all. Reaching for useState there causes extra,
 *    pointless re-renders; useRef is the "I need to remember this, but I'm
 *    not asking React to redraw because of it" tool.
 */

function FocusInputExample() {
  // Case 1: a handle to the real DOM node, so an event handler outside
  // React's render cycle (a plain button click) can call imperative DOM
  // APIs React itself doesn't expose a declarative prop for.
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="card">
      <h3>DOM ref: imperative focus()</h3>
      <input ref={inputRef} type="text" placeholder="click the button to focus me" />
      <button type="button" onClick={() => inputRef.current?.focus()}>
        Focus the input
      </button>
    </div>
  )
}

function RenderCountExample() {
  // Case 2: persisted across renders, read/written freely, but mutating it
  // does NOT schedule a re-render — contrast with the useState counter
  // right next to it, which re-renders the component on every bump.
  const renderCountRef = useRef(0)
  renderCountRef.current += 1

  const [stateCount, setStateCount] = useState(0)
  const [, forceRerender] = useState(0)

  return (
    <div className="card">
      <h3>Persisting a value without causing a re-render</h3>
      <p>
        ref-based counter (mutating it never re-renders on its own):{' '}
        <strong>{renderCountRef.current}</strong>
      </p>
      <p>
        state-based counter (every increment forces a re-render):{' '}
        <strong>{stateCount}</strong>
      </p>
      <div className="button-row">
        <button
          type="button"
          onClick={() => {
            // This DOES mutate the ref, but nothing on screen updates yet —
            // there's no re-render to reflect it until something else
            // triggers one.
            renderCountRef.current += 1
          }}
        >
          Bump ref silently (no re-render)
        </button>
        <button type="button" onClick={() => setStateCount((c) => c + 1)}>
          Bump state (re-renders, also increments ref via the render above)
        </button>
        <button type="button" onClick={() => forceRerender((n) => n + 1)}>
          Force a re-render (reveals the ref's real current value)
        </button>
      </div>
    </div>
  )
}

function StopwatchExample() {
  const [elapsedMs, setElapsedMs] = useState(0)
  const [running, setRunning] = useState(false)
  // The interval id must survive across renders so start()/stop() called
  // on different renders can still find and clear the SAME interval. If
  // this were a plain variable it would be reset to undefined every
  // render; if it were useState, clearing it would itself trigger a
  // needless re-render for a value the UI never actually displays.
  const intervalIdRef = useRef<number | null>(null)

  function start() {
    if (intervalIdRef.current !== null) return
    setRunning(true)
    intervalIdRef.current = window.setInterval(() => {
      setElapsedMs((ms) => ms + 100)
    }, 100)
  }

  function stop() {
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current)
      intervalIdRef.current = null
    }
    setRunning(false)
  }

  // Safety net: if the component unmounts while running, clear the
  // interval so it doesn't keep firing against a dead component.
  useEffect(() => {
    return () => {
      if (intervalIdRef.current !== null) window.clearInterval(intervalIdRef.current)
    }
  }, [])

  return (
    <div className="card">
      <h3>Mutable storage across renders: a stopwatch's interval id</h3>
      <p className="count-display">{(elapsedMs / 1000).toFixed(1)}s</p>
      <div className="button-row">
        <button type="button" onClick={start} disabled={running}>
          Start
        </button>
        <button type="button" onClick={stop} disabled={!running}>
          Stop
        </button>
        <button
          type="button"
          onClick={() => {
            stop()
            setElapsedMs(0)
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default function RefDemo() {
  return (
    <Section
      title="useRef — DOM handles and non-rendering mutable state"
      concept={
        'Three uses: grabbing a real DOM node imperatively, holding a value ' +
        "that changes without triggering a re-render, and storing an " +
        "interval/timeout id that logic needs but the UI never directly " +
        "displays."
      }
    >
      <div className="side-by-side three-up">
        <FocusInputExample />
        <RenderCountExample />
        <StopwatchExample />
      </div>
    </Section>
  )
}

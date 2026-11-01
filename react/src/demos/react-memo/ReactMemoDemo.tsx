import { memo, useEffect, useRef, useState } from 'react'
import Section from '../../components/Section'

/**
 * WHY React.memo helps sometimes and does nothing other times:
 *
 * React.memo wraps a component so React can skip re-rendering it when its
 * props are "the same as last time" — compared with Object.is on each
 * prop, shallowly, by default. That comparison is the whole mechanism,
 * and it's also exactly where the common senior-interview trap lives:
 * shallow comparison means a NEW object/array/function reference counts
 * as "different," even if its contents are identical to last render's.
 *
 * Below, a parent re-renders every second (a ticking clock — something
 * genuinely unrelated to either child). StableChild gets a plain string
 * prop that never changes identity, so memo's comparison succeeds and it
 * never re-renders on the clock tick. UnstableChild gets an object literal
 * built fresh in the parent's render (`{ label: name }`), which is a new
 * reference every time no matter what `name` is — so memo's comparison
 * fails every tick, and it re-renders exactly as often as it would
 * without memo at all. The fix isn't "don't use memo," it's that memo is
 * only as good as the stability of what's passed in: the object would
 * need its own useMemo (and any callback its own useCallback) upstream
 * for the wrapping to pay off.
 */

const StableChild = memo(function StableChild({ name }: { name: string }) {
  const renders = useRef(0)
  renders.current += 1
  return (
    <div className="card">
      <h3>StableChild (memoized, receives a plain string)</h3>
      <p>name = {name}</p>
      <p>
        Renders: <strong>{renders.current}</strong>
      </p>
    </div>
  )
})

const UnstableChild = memo(function UnstableChild({ config }: { config: { label: string } }) {
  const renders = useRef(0)
  renders.current += 1
  return (
    <div className="card">
      <h3>UnstableChild (memoized, receives a new object every render)</h3>
      <p>label = {config.label}</p>
      <p>
        Renders: <strong>{renders.current}</strong>
      </p>
    </div>
  )
})

export default function ReactMemoDemo() {
  const [seconds, setSeconds] = useState(0)
  const [name, setName] = useState('Ada')

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <Section
      title="React.memo — when it helps, and the common gotcha when it doesn't"
      concept={
        'The parent re-renders every second from its own clock. StableChild ' +
        "stops re-rendering after mount because its prop never changes " +
        'identity. UnstableChild keeps re-rendering every second DESPITE ' +
        "being wrapped in memo, because `{ label: name }` is built fresh on " +
        "every render — a new object reference memo has to treat as " +
        '"changed," even though its contents never differ from last time.'
      }
    >
      <div className="card">
        <p>Clock: {seconds}s</p>
        <label className="field">
          Name (changing this is the only thing that should re-render StableChild):
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
      </div>
      <div className="side-by-side">
        <StableChild name={name} />
        <UnstableChild config={{ label: name }} />
      </div>
    </Section>
  )
}

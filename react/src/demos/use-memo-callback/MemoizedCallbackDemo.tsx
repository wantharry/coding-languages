import { memo, useCallback, useRef, useState } from 'react'
import Section from '../../components/Section'

/**
 * WHY useCallback exists:
 *
 * A function literal defined inside a component body is a brand-new
 * object every render — `() => {}` from render #1 and `() => {}` from
 * render #2 are not === to each other, even though they look identical in
 * the source. That's irrelevant most of the time. It becomes relevant the
 * moment that function is a prop to a child wrapped in React.memo:
 * memo's whole mechanism is "skip re-rendering if every prop is === to
 * last time." A new function reference every render means that check
 * fails every time, so the memoized child re-renders anyway — memo buys
 * nothing.
 *
 * useCallback returns the SAME function reference across renders as long
 * as its dependency array is unchanged, which is what actually lets
 * memo's prop comparison succeed.
 */

const ChildButton = memo(function ChildButton({
  onClick,
  label,
}: {
  onClick: () => void
  label: string
}) {
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <div className="child-box">
      <p>
        {label} — rendered <strong>{renderCount.current}</strong> time(s)
      </p>
      <button type="button" onClick={onClick}>
        child action
      </button>
    </div>
  )
})

export default function MemoizedCallbackDemo() {
  const [parentTick, setParentTick] = useState(0)
  const [childClicks, setChildClicks] = useState(0)

  // New function identity every render: ChildButton below will re-render
  // every time the parent does, DESPITE being wrapped in React.memo,
  // because `onClick` never compares equal to last render's `onClick`.
  const unstableHandler = () => setChildClicks((c) => c + 1)

  // Same function identity across renders, because the dependency array
  // ([]) never changes — setChildClicks from useState is itself stable,
  // so it's safe to omit... but we still need SOME deps array, and []
  // here just means "never needs to be recreated."
  const stableHandler = useCallback(() => setChildClicks((c) => c + 1), [])

  return (
    <Section
      title="useCallback — stable references for memo to work"
      concept={
        'Click "re-render parent" a few times. The left child (unstable ' +
        'inline handler) re-renders every single time, even though it is ' +
        'wrapped in React.memo. The right child (useCallback handler) does ' +
        'not re-render at all, because its prop stayed referentially equal.'
      }
    >
      <div className="card">
        <button type="button" onClick={() => setParentTick((t) => t + 1)}>
          Re-render parent (tick: {parentTick})
        </button>
        <p>Child clicks recorded: {childClicks}</p>
        <div className="side-by-side">
          <ChildButton onClick={unstableHandler} label="Without useCallback" />
          <ChildButton onClick={stableHandler} label="With useCallback" />
        </div>
      </div>
    </Section>
  )
}

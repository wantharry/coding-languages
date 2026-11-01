import { useEffect, useState } from 'react'
import Section from '../../components/Section'
import LogPanel, { stamp } from '../../components/LogPanel'

/**
 * WHY the dependency array exists at all:
 *
 * An effect is "synchronize this component with something outside React's
 * render output" (a subscription, a timer, the DOM, a network request).
 * React can't know what external thing your effect touches, so you tell it
 * via the dependency array: "re-run this synchronization whenever any of
 * these render-produced values change." React re-runs the effect by
 * diffing the dependency array between renders with Object.is.
 *
 * The three forms genuinely mean different things, not just "fewer vs more
 * re-runs":
 *
 *  - No array at all        -> runs after every single render. There is no
 *    dependency list to diff, so there's nothing to skip. Rarely what you
 *    want; mostly useful for debugging or syncing to literally everything.
 *  - []  (empty array)      -> there is a list, and it never has anything
 *    in it that can change, so the effect runs once after the first render
 *    (mount) and its cleanup runs once on unmount. This is for "set up a
 *    subscription for the component's whole lifetime."
 *  - [dep] (one or more)    -> runs after mount, and again after any render
 *    where `dep` is different from last time. Before that *second* run,
 *    React calls the cleanup from the *previous* run first — cleanup
 *    always pairs with the run it followed, not with unmount specifically.
 *
 * Cleanup itself exists because effects create things that outlive a
 * single render (listeners, intervals, in-flight requests). Without
 * cleanup, every re-run would pile a new one on top of the old, uncanceled
 * one — the classic "duplicate event listeners" / "interval that never
 * stops" leak.
 */

function NoArrayEffect() {
  const [, forceRerender] = useState(0)
  const [log, setLog] = useState<string[]>([])

  useEffect(() => {
    // No dependency array -> no diffing happens -> this runs after
    // EVERY render, including the one caused by setLog below. If this
    // effect itself called setLog unconditionally, that would be an
    // infinite render loop — a very common first bug with this form.
    setLog((l) => [...l, stamp('effect ran (no dependency array)')])
  })

  return (
    <div className="card">
      <h3>No array: runs after every render</h3>
      <button type="button" onClick={() => forceRerender((n) => n + 1)}>
        Force a re-render
      </button>
      <LogPanel lines={log} />
    </div>
  )
}

function EmptyArrayEffect() {
  const [mounted, setMounted] = useState(true)
  const [log, setLog] = useState<string[]>([])

  if (!mounted) {
    return (
      <div className="card">
        <h3>[] empty array: mount once, cleanup on unmount</h3>
        <button type="button" onClick={() => setMounted(true)}>
          Remount
        </button>
        <LogPanel lines={log} />
      </div>
    )
  }

  return (
    <EmptyArrayChild
      log={log}
      onEvent={(msg) => setLog((l) => [...l, msg])}
      onUnmountRequest={() => setMounted(false)}
    />
  )
}

function EmptyArrayChild({
  log,
  onEvent,
  onUnmountRequest,
}: {
  log: string[]
  onEvent: (msg: string) => void
  onUnmountRequest: () => void
}) {
  const [, forceRerender] = useState(0)

  useEffect(() => {
    onEvent(stamp('mount effect ran (will only happen once, until unmounted)'))
    // The cleanup function. With an empty array, this only fires when the
    // component is actually removed from the tree — there is no later
    // re-run to clean up before.
    return () => {
      onEvent(stamp('cleanup ran on unmount'))
    }
    // `onEvent` is intentionally left out of the dependency array: it's a
    // new function reference each render (see the useMemo/useCallback demo
    // for why), but this effect only cares about running once at mount, not
    // about staying in sync with `onEvent` — so an exhaustive-deps lint
    // here would be a false alarm.
  }, [])

  return (
    <div className="card">
      <h3>[] empty array: mount once, cleanup on unmount</h3>
      <div className="button-row">
        <button type="button" onClick={() => forceRerender((n) => n + 1)}>
          Re-render (effect won't re-run)
        </button>
        <button type="button" onClick={onUnmountRequest}>
          Unmount
        </button>
      </div>
      <LogPanel lines={log} />
    </div>
  )
}

function DepArrayEffect() {
  const [userId, setUserId] = useState(1)
  const [log, setLog] = useState<string[]>([])

  useEffect(() => {
    setLog((l) => [...l, stamp(`effect ran for userId=${userId} (subscribing)`)])
    // Pretend this subscribes to "user ${userId}'s" live updates. If userId
    // changes before we unsubscribe from the OLD id, we'd leak a stale
    // subscription still reacting to the wrong user — so cleanup must run
    // with the id it closed over, before the next run starts.
    return () => {
      setLog((l) => [...l, stamp(`cleanup ran for userId=${userId} (unsubscribing)`)])
    }
  }, [userId])

  return (
    <div className="card">
      <h3>[userId]: re-run only when userId changes</h3>
      <div className="button-row">
        <button type="button" onClick={() => setUserId((id) => id + 1)}>
          Switch to next user
        </button>
        <button
          type="button"
          onClick={() => setLog((l) => [...l, stamp('unrelated re-render (no userId change)')])}
        >
          Unrelated re-render
        </button>
      </div>
      <LogPanel lines={log} />
    </div>
  )
}

export default function EffectLifecycleDemo() {
  return (
    <Section
      title="useEffect — dependency arrays and cleanup"
      concept={
        'Three independent effects, three different timing rules. Watch the ' +
        'log for each: no-array re-runs on every render; [] runs once and ' +
        "cleans up only on unmount; [userId] re-runs (with a cleanup in " +
        "between) only when userId actually changes."
      }
    >
      <div className="side-by-side three-up">
        <NoArrayEffect />
        <EmptyArrayEffect />
        <DepArrayEffect />
      </div>
    </Section>
  )
}

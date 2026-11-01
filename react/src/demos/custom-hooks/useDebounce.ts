import { useEffect, useState } from 'react'

/**
 * WHY a custom hook, and why this one:
 *
 * A custom hook is just a function that calls other hooks and bundles up
 * a piece of reusable stateful logic — React doesn't know or care that
 * it's "a hook" beyond the naming convention; what matters is it composes
 * useState/useEffect/etc. the same way a component would, so the rules of
 * hooks still apply wherever it's called.
 *
 * useDebounce solves a specific, common problem: a value changes rapidly
 * (every keystroke in a search box), but acting on every intermediate
 * value is wasteful or wrong (firing a network request per keystroke).
 * The hook returns a second, "settled" value that only updates once the
 * input has stopped changing for `delayMs`.
 *
 * The mechanism is a direct application of the useEffect cleanup rule
 * covered elsewhere in this project: every time `value` changes, this
 * effect schedules a timeout to adopt it — but first cleans up (cancels)
 * whatever timeout the previous run scheduled. If `value` changes again
 * before the delay elapses, the stale pending timeout never fires, so
 * only the LAST value in a rapid burst ever gets adopted.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebounced(value), delayMs)
    // Cancels the previous pending timeout before the next effect run
    // schedules a new one. Without this, every keystroke would schedule
    // yet another timeout that eventually fires, and `debounced` would
    // thrash through every intermediate value instead of settling once.
    return () => window.clearTimeout(timeoutId)
  }, [value, delayMs])

  return debounced
}

import { useEffect, useState } from 'react'
import Section from '../../components/Section'
import LogPanel, { stamp } from '../../components/LogPanel'
import { useDebounce } from './useDebounce'
import { useFetch } from './useFetch'

/**
 * Composes two custom hooks to model a realistic "search-as-you-type"
 * feature: useDebounce settles the raw keystrokes into one value that
 * only updates after a pause, and useFetch turns that settled value into
 * a request — complete with the abort-on-change protection documented in
 * useFetch.ts.
 *
 * Try it: type a few characters quickly, then stop. The log shows every
 * keystroke immediately, but only one "fetching for" entry once typing
 * settles — and if you change the query again before a slow request
 * finishes, the log shows the stale one being aborted rather than its
 * result ever appearing.
 */
export default function CustomHooksDemo() {
  const [raw, setRaw] = useState('')
  const debounced = useDebounce(raw, 500)
  const [log, setLog] = useState<string[]>([])

  useEffect(() => {
    if (raw !== '') setLog((l) => [...l, stamp(`keystroke — raw = "${raw}"`)])
  }, [raw])

  useEffect(() => {
    if (debounced !== '') setLog((l) => [...l, stamp(`debounced settled -> "${debounced}"`)])
  }, [debounced])

  // Deliberately slow (1200ms) so it's easy to change the query again
  // before a request resolves, and watch the abort protection kick in.
  const { data, error, loading } = useFetch<{ url: string; fetchedAt: string }>(
    debounced ? `/search?q=${encodeURIComponent(debounced)}` : '',
    1200,
  )

  return (
    <Section
      title="Custom hooks — useDebounce + useFetch composed together"
      concept={
        'Typing "error" anywhere in the query simulates a failed request. ' +
        "Typing quickly and changing your mind mid-request shows the " +
        "previous in-flight fetch getting silently aborted instead of " +
        "racing the newer one to update the screen."
      }
    >
      <div className="card">
        <label className="field">
          Search query:
          <input
            type="text"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder='try typing, or type "error"'
          />
        </label>

        <p>
          debounced value: <code>{debounced || '(empty)'}</code>
        </p>

        <div className="fetch-status">
          {!debounced && <p>Type something to search.</p>}
          {debounced && loading && <p>Loading…</p>}
          {debounced && error && <p className="error-text">Error: {error.message}</p>}
          {debounced && data && (
            <p>
              Result for <code>{debounced}</code>: fetched at {data.fetchedAt}
            </p>
          )}
        </div>

        <LogPanel lines={log} />
      </div>
    </Section>
  )
}

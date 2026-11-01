import { useEffect, useState } from 'react'

export interface FetchState<T> {
  data: T | null
  error: Error | null
  loading: boolean
}

/**
 * Stands in for a real `fetch()` call. Kept deterministic and offline so
 * this whole project builds and runs without network access, but it
 * models the two things that actually matter for the hook below: it takes
 * time, and it's cancelable via AbortSignal.
 */
async function mockNetworkRequest<T>(
  url: string,
  signal: AbortSignal,
  latencyMs: number,
): Promise<T> {
  await new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(resolve, latencyMs)
    signal.addEventListener('abort', () => {
      window.clearTimeout(timeoutId)
      reject(new DOMException('The request was aborted', 'AbortError'))
    })
  })
  if (url.includes('error')) {
    throw new Error(`Simulated failure fetching "${url}"`)
  }
  return { url, fetchedAt: new Date().toLocaleTimeString() } as unknown as T
}

/**
 * WHY this composes useState + useEffect, and why the cleanup matters:
 *
 * The naive version of a data-fetching hook — fetch in an effect, setState
 * when it resolves — has a real bug: requests are not guaranteed to
 * resolve in the order they were sent. If `url` changes while a request
 * for the OLD url is still in flight, and that old request happens to
 * resolve after the new one, its "success" handler would overwrite fresh
 * data with stale data. This is the "race condition" senior interviews
 * like to probe for in data-fetching hooks specifically.
 *
 * The fix is the same cleanup mechanism useEffect always uses: each run
 * creates its own AbortController. When `url` changes, React runs this
 * effect's cleanup before the next one starts, aborting whatever request
 * belonged to the PREVIOUS url. The abort rejects that request's promise,
 * the catch block sees `signal.aborted` and bails out without touching
 * state — so only the most recent request still standing is ever allowed
 * to update `data`. The same abort fires on unmount, which also prevents
 * the classic "setState called on an unmounted component" warning.
 */
export function useFetch<T>(url: string, latencyMs = 1000): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ data: null, error: null, loading: true })

  useEffect(() => {
    const controller = new AbortController()
    setState({ data: null, error: null, loading: true })

    mockNetworkRequest<T>(url, controller.signal, latencyMs)
      .then((data) => {
        setState({ data, error: null, loading: false })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return // superseded by a newer request — ignore it
        setState({
          data: null,
          error: err instanceof Error ? err : new Error(String(err)),
          loading: false,
        })
      })

    return () => controller.abort()
  }, [url, latencyMs])

  return state
}

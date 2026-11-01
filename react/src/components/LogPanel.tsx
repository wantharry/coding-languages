/**
 * Several demos (useEffect timing, useDebounce, useFetch's race condition)
 * are only convincing if you can literally watch events happen in order,
 * with timestamps. A console.log would work too, but burying the proof in
 * devtools defeats the point of a self-contained teaching example — so
 * every demo that needs a timeline renders into this instead.
 */
export default function LogPanel({ lines }: { lines: string[] }) {
  return (
    <div className="log-panel" aria-live="polite">
      {lines.length === 0 ? (
        <p className="log-empty">(no events yet)</p>
      ) : (
        <ol>
          {lines.map((line, i) => (
            // Index-as-key is fine here ON PURPOSE: this list is append-only,
            // never reordered or spliced, and the items carry no per-node
            // DOM/input state of their own. That's exactly the situation
            // where index keys are safe — contrast with src/demos/keys.
            <li key={i}>{line}</li>
          ))}
        </ol>
      )}
    </div>
  )
}

/** Small helper so every demo timestamps log lines the same way. */
export function stamp(message: string): string {
  const t = new Date()
  const ms = t.getMilliseconds().toString().padStart(3, '0')
  return `${t.toLocaleTimeString()}.${ms} — ${message}`
}

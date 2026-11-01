import { useRef, useState } from 'react'

/**
 * Uncontrolled: the DOM input manages its own value internally, the way a
 * plain HTML <input> always has. React never re-renders on keystrokes
 * because nothing in React state is tied to what's typed — this component
 * doesn't even know the current value until something asks for it. A
 * `defaultValue` just seeds the initial text; after that the browser owns
 * it. A ref is used to reach in and read the value only when it's
 * actually needed (here, on submit).
 *
 * This is the right default for simple forms, forms integrating a
 * non-React widget that wants to own its own input, or large forms where
 * per-keystroke re-renders of a controlled version would be wasteful —
 * at the cost of losing synchronous access to the value for live
 * validation or formatting-as-you-type.
 */
export default function UncontrolledForm() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="card">
      <h3>Uncontrolled form</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          // The only place this component looks at the input's value at
          // all: pulled imperatively from the DOM node via the ref, not
          // tracked in React state as the user types.
          const value = inputRef.current?.value ?? ''
          const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          if (!isValidEmail) {
            setError('Not a valid email')
            setSubmitted(null)
            return
          }
          setError(null)
          setSubmitted(value)
        }}
      >
        <label className="field">
          Email:
          <input ref={inputRef} type="text" defaultValue="" placeholder="you@example.com" />
        </label>
        <p className="hint">No validation feedback until you submit — React isn't watching every keystroke.</p>
        <button type="submit">Submit</button>
      </form>
      {error && <p className="error-text">{error}</p>}
      {submitted && <p className="count-display">Submitted: {submitted}</p>}
    </div>
  )
}

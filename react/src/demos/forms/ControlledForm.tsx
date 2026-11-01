import { useState } from 'react'

/**
 * Controlled: the input's `value` is driven entirely by React state, and
 * every keystroke flows through `onChange` back into that state. React is
 * the single source of truth for what the input displays; the DOM input
 * is just a rendering of that state. This is what makes live validation,
 * conditionally disabling submit, formatting-as-you-type, or mirroring
 * the value elsewhere on the page possible — the value is always
 * available in React-land, synchronously, on every change.
 *
 * The cost: every keystroke is a state update, which is a re-render of
 * this component (and, naively, anything under it). For most forms that's
 * irrelevant; for a form with hundreds of fields re-rendering together it
 * can become a real performance concern — which is the usual argument for
 * reaching for uncontrolled inputs or a form library's isolated-field
 * subscriptions instead.
 */
export default function ControlledForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState<string | null>(null)

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  return (
    <div className="card">
      <h3>Controlled form</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitted(email)
        }}
      >
        <label className="field">
          Email:
          <input
            type="text"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setSubmitted(null)
            }}
            placeholder="you@example.com"
          />
        </label>
        {/* Only possible because React already knows the value on every
            keystroke — no need to "ask" the DOM what it currently holds. */}
        <p className={isValidEmail || email === '' ? 'hint' : 'error-text'}>
          {email === '' ? 'Start typing…' : isValidEmail ? 'Looks valid' : 'Not a valid email yet'}
        </p>
        <button type="submit" disabled={!isValidEmail}>
          Submit
        </button>
      </form>
      {submitted && <p className="count-display">Submitted: {submitted}</p>}
    </div>
  )
}

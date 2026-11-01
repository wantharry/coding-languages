import { useRef, useState } from 'react'
import Section from '../../components/Section'

/**
 * The virtual DOM, honestly:
 *
 * React's programming model is declarative: a component describes what
 * the UI should look like for a given state, not the sequence of DOM
 * operations to get there. Something still has to turn "here's the new
 * description" into actual DOM mutations, because the real DOM is what
 * the browser paints. The virtual DOM is React's lightweight, in-memory
 * representation of that description (a tree of plain JS objects, not
 * real nodes) — cheap to create and throw away compared to real DOM
 * nodes, which carry far more baggage (layout, style, attached listeners,
 * browser internals).
 *
 * On a re-render, React builds a new virtual tree and compares it to the
 * previous one — "reconciliation" — to work out the minimal set of real
 * DOM mutations that would turn the old output into the new one, then
 * applies only those. The alternative it replaces isn't "a faster way to
 * change the DOM than React's way" so much as "manually figuring out,
 * for every state change, exactly which real nodes need to change and
 * writing that by hand" — which is what direct DOM manipulation requires,
 * and which gets unmanageable fast as an app's state and UI grow.
 *
 * Two honest caveats, since this gets overclaimed a lot:
 *   - It is not inherently faster than hand-written imperative DOM code.
 *     Hand-tuned code that knows exactly what changed can always beat a
 *     general-purpose diffing algorithm. What React buys instead is a
 *     consistent, good-enough-by-default performance profile without
 *     having to hand-write that tracking yourself for every interaction.
 *   - Diffing needs a way to match old tree nodes to new ones, especially
 *     in lists — that's exactly the identity problem `key` solves (see
 *     the keys demo). Reconciliation is the mechanism; keys are the
 *     identity signal that makes list diffing correct instead of
 *     position-based guessing.
 *
 * One concrete, provable consequence of React controlling when it commits
 * to the real DOM (rather than mutating it synchronously on every single
 * state call) is BATCHING: multiple setState calls inside one event
 * handler are grouped into a single re-render and a single real DOM
 * commit, not one per call. The button below calls setState three times
 * in a row; the commit counter below still only increments once.
 */
export default function VirtualDomExplainer() {
  const [n, setN] = useState(0)
  const commitCount = useRef(0)
  commitCount.current += 1 // runs once per actual render/commit, proving the count below

  return (
    <Section
      title="The virtual DOM and reconciliation"
      concept="A short, honest explanation of what problem the virtual DOM actually solves, plus a live, provable example of batching — a direct consequence of React (not the browser) deciding when a render actually commits to the real DOM."
    >
      <div className="card">
        <p>n = {n}</p>
        <p>
          Component commits so far: <strong>{commitCount.current}</strong>
        </p>
        <button
          type="button"
          onClick={() => {
            // Three separate state updates, same event handler. If React
            // re-rendered/committed synchronously on every setState call,
            // the commit counter above would jump by 3. It jumps by 1:
            // React batches all three into one render pass.
            setN((v) => v + 1)
            setN((v) => v + 1)
            setN((v) => v + 1)
          }}
        >
          Call setN three times in one handler
        </button>
        <p className="hint">n increases by 3, but the commit counter only increases by 1 — one batched render for all three updates.</p>
      </div>
    </Section>
  )
}

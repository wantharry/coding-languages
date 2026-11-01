import { useState } from 'react'
import Section from '../../components/Section'

/**
 * WHY keys matter:
 *
 * When React re-renders a list, it needs to decide which old DOM nodes
 * correspond to which new array items — reuse them if "the same," create
 * new ones and destroy old ones otherwise. The `key` is literally the only
 * signal React has for "this is the same logical item as before, just
 * possibly in a different position/with different props." Without a
 * stable key, React falls back to matching by POSITION, and position is
 * not identity: if you delete item #2, everything after it shifts up one
 * slot, and React, keying by index, concludes "slot 2 still exists, its
 * item just changed" rather than "item #2 is gone."
 *
 * For a plain, fully-controlled display list, that distinction rarely
 * matters because React still re-renders the correct text into each slot.
 * It breaks visibly the moment a list item owns its OWN uncontrolled DOM
 * state — exactly what an uncontrolled <input> does. React reuses the DOM
 * node for "slot 2" (including whatever the user typed into it) and just
 * re-renders slot 2's label underneath, so the typed text appears to leap
 * onto the wrong logical item.
 */

interface Item {
  id: number
  label: string
}

const seed: Item[] = [
  { id: 1, label: 'Alpha' },
  { id: 2, label: 'Bravo' },
  { id: 3, label: 'Charlie' },
  { id: 4, label: 'Delta' },
]

function BadList() {
  const [items, setItems] = useState<Item[]>(seed)

  return (
    <div className="card">
      <h3>key={'{'}index{'}'} — buggy</h3>
      <p className="hint">Type a note into each box, then delete "Bravo."</p>
      {items.map((item, index) => (
        // The bug, in one line: the key is derived from POSITION, not
        // from the item's own identity.
        <div className="key-row" key={index}>
          <span className="key-label">{item.label}</span>
          <input type="text" defaultValue="" placeholder="type a note…" />
          <button type="button" onClick={() => setItems((is) => is.filter((i) => i.id !== item.id))}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}

function GoodList() {
  const [items, setItems] = useState<Item[]>(seed)

  return (
    <div className="card">
      <h3>key={'{'}item.id{'}'} — correct</h3>
      <p className="hint">Same steps: type a note into each box, then delete "Bravo."</p>
      {items.map((item) => (
        // Stable, identity-based key: when "Bravo" is removed from the
        // array, React matches this exact key to "no longer present" and
        // removes that specific DOM node — notes typed into Alpha/Charlie/
        // Delta's own inputs are untouched because their nodes were never
        // reused for a different item.
        <div className="key-row" key={item.id}>
          <span className="key-label">{item.label}</span>
          <input type="text" defaultValue="" placeholder="type a note…" />
          <button type="button" onClick={() => setItems((is) => is.filter((i) => i.id !== item.id))}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}

export default function KeysDemo() {
  return (
    <Section
      title="Why keys matter in lists"
      concept={
        "Type a distinct note into each row's input in BOTH lists, then " +
        'delete "Bravo" from each. In the index-keyed list, the notes you ' +
        'typed appear to shift up a row (because React reused DOM nodes by ' +
        'position, not identity). In the id-keyed list, only the correct ' +
        "row's note disappears."
      }
    >
      <div className="side-by-side">
        <BadList />
        <GoodList />
      </div>
    </Section>
  )
}

import type { ReactNode } from 'react'

interface SectionProps {
  title: string
  concept: string
  children: ReactNode
}

/**
 * Plain layout wrapper used by every demo topic so the actual teaching
 * content (the WHY, in `concept`) is visually separated from the live
 * demo (`children`). Deliberately dumb: no state, no hooks. Its only job
 * is to stop every demo file from repeating the same <section><h2>...
 * boilerplate.
 */
export default function Section({ title, concept, children }: SectionProps) {
  return (
    <section className="demo-section">
      <h2>{title}</h2>
      <p className="concept">{concept}</p>
      <div className="demo-body">{children}</div>
    </section>
  )
}

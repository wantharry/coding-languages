import { createContext, useContext, useState, type ReactNode } from 'react'
import Section from '../../components/Section'

/**
 * WHY useContext exists:
 *
 * Props flow one direction: parent to child, one level at a time. If a
 * deeply nested component needs a value that only a distant ancestor
 * knows about (theme, current user, locale), the "normal" way is to pass
 * it as a prop through every component in between — "prop drilling." That
 * is not just verbose: every intermediate component that has no actual
 * use for the value still has to know its shape, forward it correctly,
 * and gets a changed signature if the value's type ever changes.
 *
 * Context lets a provider higher up the tree make a value directly
 * readable by any descendant that calls useContext, skipping every
 * component in between entirely. The tradeoff (the senior-interview part):
 * it couples the consuming component to "some ancestor provides this
 * context," which is an implicit dependency, harder to trace than an
 * explicit prop — so it's a tool for genuinely cross-cutting concerns
 * (theme, auth, locale), not a default replacement for props in general.
 */

type Theme = 'light' | 'dark'
interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    // Guards against using the hook outside its provider — a real bug
    // class with context, since there's no compile-time link between a
    // consumer and "did someone actually wrap me in the provider."
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

// --- A 4-level deep tree. Page and Panel genuinely know nothing about
// theming — they exist purely for layout, and under prop drilling they
// would still be forced to accept and forward a `theme` prop they never
// use themselves, every time a sibling three levels down needs it.

function Page({ children }: { children: ReactNode }) {
  return <div className="ctx-level">Page{children}</div>
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="ctx-level">Panel{children}</div>
}

function Toolbar() {
  // Reads the context directly — no prop was threaded through Page or
  // Panel to get it here.
  const { theme, toggleTheme } = useTheme()
  return (
    <div className={`ctx-level themed-leaf ${theme}`}>
      Toolbar (theme: {theme})
      <button type="button" onClick={toggleTheme}>
        Toggle theme
      </button>
    </div>
  )
}

function Avatar() {
  const { theme } = useTheme()
  return <div className={`ctx-level themed-leaf ${theme}`}>Avatar (theme: {theme})</div>
}

export default function ContextDemo() {
  return (
    <Section
      title="useContext — avoiding prop drilling"
      concept={
        'Page -> Panel -> Toolbar/Avatar is 3-4 levels deep. Page and Panel ' +
        'never touch the theme at all; only the two leaves do, by calling ' +
        'useTheme() directly. Toggling the theme updates both leaves without ' +
        'Page or Panel ever being aware a theme exists.'
      }
    >
      <ThemeProvider>
        <Page>
          <Panel>
            <Toolbar />
            <Avatar />
          </Panel>
        </Page>
      </ThemeProvider>
    </Section>
  )
}

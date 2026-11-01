import { useState, type ReactElement } from 'react'
import StaleClosureDemo from './demos/use-state/StaleClosureDemo'
import EffectLifecycleDemo from './demos/use-effect/EffectLifecycleDemo'
import ExpensiveComputationDemo from './demos/use-memo-callback/ExpensiveComputationDemo'
import MemoizedCallbackDemo from './demos/use-memo-callback/MemoizedCallbackDemo'
import RefDemo from './demos/use-ref/RefDemo'
import ContextDemo from './demos/use-context/ContextDemo'
import CustomHooksDemo from './demos/custom-hooks/CustomHooksDemo'
import FormsDemo from './demos/forms/FormsDemo'
import KeysDemo from './demos/keys/KeysDemo'
import ReactMemoDemo from './demos/react-memo/ReactMemoDemo'
import VirtualDomExplainer from './demos/virtual-dom/VirtualDomExplainer'
import './App.css'

interface Topic {
  id: string
  label: string
  render: () => ReactElement
}

// Each topic is a self-contained demo file under src/demos/. This array
// is just navigation glue — the actual teaching content lives in the
// files it points to.
const topics: Topic[] = [
  { id: 'use-state', label: 'useState: stale closures', render: () => <StaleClosureDemo /> },
  { id: 'use-effect', label: 'useEffect: deps & cleanup', render: () => <EffectLifecycleDemo /> },
  {
    id: 'use-memo',
    label: 'useMemo: expensive computation',
    render: () => <ExpensiveComputationDemo />,
  },
  {
    id: 'use-callback',
    label: 'useCallback + memo: child re-renders',
    render: () => <MemoizedCallbackDemo />,
  },
  { id: 'use-ref', label: 'useRef: DOM & persisted values', render: () => <RefDemo /> },
  { id: 'use-context', label: 'useContext: avoiding prop drilling', render: () => <ContextDemo /> },
  { id: 'custom-hooks', label: 'Custom hooks: useDebounce + useFetch', render: () => <CustomHooksDemo /> },
  { id: 'forms', label: 'Controlled vs uncontrolled forms', render: () => <FormsDemo /> },
  { id: 'keys', label: 'Why keys matter in lists', render: () => <KeysDemo /> },
  { id: 'react-memo', label: 'React.memo: when it does (not) help', render: () => <ReactMemoDemo /> },
  { id: 'virtual-dom', label: 'Virtual DOM & reconciliation', render: () => <VirtualDomExplainer /> },
]

function App() {
  // This component's own useState usage is plain app-shell plumbing (tab
  // selection), not itself one of the teaching examples.
  const [activeId, setActiveId] = useState(topics[0].id)
  const active = topics.find((t) => t.id === activeId) ?? topics[0]

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>React Interview Prep</h1>
        <p>Working, hands-on examples of React's core mechanics — not just the API, but why it behaves that way.</p>
      </header>
      <div className="app-layout">
        <nav className="topic-nav" aria-label="Topics">
          {topics.map((t) => (
            <button
              key={t.id}
              type="button"
              className={t.id === activeId ? 'topic-link active' : 'topic-link'}
              onClick={() => setActiveId(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <main className="topic-content">{active.render()}</main>
      </div>
    </div>
  )
}

export default App

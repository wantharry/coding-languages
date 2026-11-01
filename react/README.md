# React Interview Prep

A hands-on React + TypeScript project built to study for senior-level React
interviews. Every concept below is a real, working component or hook — not a
syntax snippet — with comments that explain **why** React behaves the way it
does and the pitfalls that trip people up in interviews.

Scaffolded with Vite (`react-ts` template). Functional components and hooks
throughout; no class components.

## Running it

```bash
npm install
npm run dev      # start the dev server (prints a localhost URL)
npm run build    # type-check with tsc, then produce a production build in dist/
```

`npm run build` has been verified to complete with zero TypeScript errors.
`npm run dev` has been verified to serve the app correctly.

## How the app is organized

`src/App.tsx` is just navigation glue: a sidebar of topics, each rendering
one demo component. All the actual teaching content lives under
`src/demos/<topic>/`, one folder per concept. `src/components/Section.tsx`
and `src/components/LogPanel.tsx` are small shared layout helpers (not
themselves teaching material).

## Topics covered

### `src/demos/use-state/StaleClosureDemo.tsx`
The "stale closure" gotcha: an event handler that schedules a delayed
`setCount(count + 1)` captures `count` from the render it was created in.
Fire it multiple times quickly and the updates collapse into one, because
every scheduled update reads the same stale snapshot. The fix,
`setCount(prev => prev + 1)`, is shown side-by-side — it reads the actual
latest state at the moment the update applies, not the value from when the
closure was created.

### `src/demos/use-effect/EffectLifecycleDemo.tsx`
Three effects, side by side, each demonstrating one dependency-array form
and what it actually does:
- **no array** — runs after every render (nothing to diff against).
- **`[]`** — runs once on mount, cleans up once on unmount.
- **`[dep]`** — runs on mount and again whenever `dep` changes, running the
  previous run's cleanup first each time.

A live log panel timestamps every run/cleanup so the ordering is directly
observable rather than asserted.

### `src/demos/use-memo-callback/`
- **`ExpensiveComputationDemo.tsx`** — a genuinely slow prime-counting
  computation. With a "memoize" toggle off, typing in an unrelated text box
  visibly lags because the whole component re-renders and recomputes the
  expensive value on every keystroke. With `useMemo`, the same computation
  only reruns when its actual dependency (`limit`) changes.
- **`MemoizedCallbackDemo.tsx`** — a `React.memo`-wrapped child re-renders on
  every parent render when it receives a plain inline arrow function as a
  prop, because a new function is a new reference every render. Wrapping
  that same handler in `useCallback` gives it a stable reference, and the
  memoized child stops re-rendering. Each child displays its own render
  count so the effect is directly visible, not just claimed.

### `src/demos/use-ref/RefDemo.tsx`
Three real uses of `useRef` side by side: imperative DOM access
(`inputRef.current?.focus()`), a value that persists across renders
*without* causing a re-render (a manual render counter, contrasted directly
against a `useState` counter that does re-render), and a mutable interval id
that a stopwatch's start/stop logic needs to survive across renders.

### `src/demos/use-context/ContextDemo.tsx`
A real 3-4 level component tree (`Page` → `Panel` → `Toolbar`/`Avatar`) where
the two middle layers never touch theming at all. `Toolbar` and `Avatar`
read the active theme directly via `useContext`, with no prop threaded
through the components in between — the actual problem prop drilling causes,
demonstrated rather than just described.

### `src/demos/custom-hooks/`
- **`useDebounce.ts`** — a generic hook that settles a rapidly-changing value
  into one that only updates after a pause, built from `useState` +
  `useEffect`'s cleanup mechanism (each keystroke's pending timeout is
  canceled by the next one).
- **`useFetch.ts`** — a data-fetching hook (backed by a deterministic mock
  network call so the whole project builds/runs offline) that guards
  against the classic data-fetching race condition: if the query changes
  while a request is in flight, the hook's cleanup aborts the stale request
  via `AbortController` so an old, slow response can never overwrite newer
  state.
- **`CustomHooksDemo.tsx`** — composes both into a realistic
  "search-as-you-type" feature, with a live log showing keystrokes, when the
  debounced value settles, and stale requests being aborted.

### `src/demos/forms/`
`ControlledForm.tsx` drives its input entirely from React state (enabling
live validation and a disabled-until-valid submit button) versus
`UncontrolledForm.tsx`, which lets the DOM own the input's value and only
reads it imperatively via `useRef` on submit (no re-render per keystroke, no
validation feedback until submit). `FormsDemo.tsx` renders both together for
direct comparison.

### `src/demos/keys/KeysDemo.tsx`
Two lists of deletable items, each row holding its own **uncontrolled**
input (so the DOM, not React, owns what's typed into it). One list uses the
array index as `key`; the other uses the item's stable `id`. Type distinct
notes into each row and delete an item from the middle: in the index-keyed
list the typed notes appear to shift onto the wrong row, because React
matched old DOM nodes to new items by position, not identity. The
id-keyed list behaves correctly.

### `src/demos/react-memo/ReactMemoDemo.tsx`
A parent re-renders every second from an unrelated clock. A memoized child
receiving a plain string prop stops re-rendering once its prop stops
changing — `React.memo` working as intended. A second memoized child
receiving a freshly-constructed object literal (`{ label: name }`) keeps
re-rendering every single tick despite being wrapped in `memo`, because a
new object reference compares as "changed" every time. The senior-interview
point made concrete: `React.memo` is only as effective as the stability of
the props it's given.

### `src/demos/virtual-dom/VirtualDomExplainer.tsx`
A short, honest write-up (as comments) of what the virtual DOM and
reconciliation actually solve, including the caveat that it isn't
inherently faster than hand-written DOM code, and the link between
reconciliation and why `key` matters for list diffing. Paired with a small,
provable live example of React batching three `setState` calls in one event
handler into a single commit.

## Notes

- `node_modules/` and `dist/` are intentionally not committed — the
  repository root's own `.gitignore` already excludes them.
- `useFetch`'s "network" call is a deterministic in-memory mock (not a real
  `fetch()`), so the project builds and runs without internet access while
  still exercising the real cancellation/race-condition logic a production
  hook would need.

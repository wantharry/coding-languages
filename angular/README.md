# Angular Senior-Interview Prep

A working Angular app built to demonstrate — not just describe — the mechanics and concepts
that come up in senior Angular interviews. Generated with the Angular CLI (v19, standalone
components, zone.js change detection) and extended with eight small, self-contained demo
pages, each one a real, running example with comments explaining *why* things work the way
they do, not just *that* they do.

## Running it

```bash
npm install        # only needed if node_modules isn't already present
ng serve            # dev server at http://localhost:4200/
ng build            # production build, output in dist/angular-interview-prep/
```

No backend is required — RxJS "HTTP calls" are simulated locally (see
`src/app/features/rxjs-demo/mock-backend.service.ts`).

## Structure

```
src/app/
├── app.component.ts/html/css   — root shell: top nav + <router-outlet>
├── app.routes.ts                — one lazy-loaded route per demo (loadComponent)
├── app.config.ts                — bootstrap config (provideZoneChangeDetection, provideRouter)
├── core/
│   └── logger.service.ts        — providedIn: 'root' singleton, used across several demos
└── features/
    ├── home/                            — landing page, links to every demo
    ├── components-demo/                 — @Component, @Input/@Output, parent/child
    ├── dependency-injection-demo/       — constructor injection, root vs. scoped providers
    ├── lifecycle-demo/                  — constructor vs. ngOnInit, ngOnDestroy cleanup
    ├── rxjs-demo/                       — Observable/subscribe, map, switchMap, unsubscribe
    ├── data-binding-demo/               — one-way vs. two-way ([(ngModel)]) binding
    ├── directives-demo/                 — @for/@if control flow + a custom attribute directive
    └── change-detection-demo/           — Default vs. OnPush, zone.js, immutability
```

Every route in `app.routes.ts` lazy-loads its component via `loadComponent`, so each demo ships
as its own JS chunk — visible in the `ng build` output as a separate "Lazy chunk file".

## What each page demonstrates

### `/components` — Components & @Input/@Output
`ComponentsDemoComponent` (parent, "smart"/container) owns a product catalog and a cart.
`ProductCardComponent` (child, "dumb"/presentational) receives a `Product` via `@Input` and
emits an `addToCart` event via `@Output` + `EventEmitter` when its button is clicked. The child
never knows a cart exists — it just emits "this happened" and lets the parent decide what to do.
This down-data/up-events split is the real answer behind "explain component communication in
Angular."

### `/dependency-injection` — Services & DI
`DependencyInjectionDemoComponent` injects two services via its constructor:
- `LoggerService` (`src/app/core/logger.service.ts`) is `providedIn: 'root'` — one instance for
  the whole app, lazily created, tree-shakable if unused.
- `SessionCounterService` is listed in *this component's own* `providers` array instead — a new
  instance is created per component instance, shared with its children (see
  `SessionCounterDisplayComponent`, a child that injects the same service without providing it
  itself, and gets the parent's instance back via the injector hierarchy), and destroyed with the
  component. Navigate away and back to see the counter reset.

### `/lifecycle` — Lifecycle Hooks
`TickerComponent` makes two classic senior questions concrete:
- **Constructor vs. ngOnInit**: the constructor logs `label=""` because Angular hasn't applied
  the `@Input` binding yet at that point — only after the constructor does Angular set inputs and
  call `ngOnInit`, which is why input-dependent setup belongs in `ngOnInit`, not the constructor.
- **ngOnDestroy**: `ngOnInit` subscribes to an RxJS `interval()` that never completes on its own.
  `ngOnDestroy` unsubscribes it. Toggle the ticker off/on from the parent and watch the log to see
  both hooks fire in the right order.

### `/rxjs` — RxJS Basics
`MockBackendService` simulates a backend with `of(...).pipe(delay(...))` and `interval(...)`.
`RxjsDemoComponent` shows:
- A plain Observable + `subscribe()` (simulated HTTP GET), including a chained `map` + `map`
  pipeline in the service.
- A typeahead search using `debounceTime` + `distinctUntilChanged` + `switchMap` — the operator
  interviewers like to probe specifically because `switchMap` cancels any still-in-flight
  previous search, avoiding the classic "slow old response overwrites a newer one" race that
  `mergeMap` would allow.
- A never-completing `interval()`-backed "server clock" stream that is manually unsubscribed in
  `ngOnDestroy` via a composed `Subscription`.

### `/data-binding` — One-way vs. Two-way Binding
Shows `[(ngModel)]` side-by-side with its manual, un-sugared equivalent: a `[value]` property
binding paired with an `(input)` event binding that writes the new value back. `[(ngModel)]` is
not a separate binding mechanism — it's syntax sugar ("banana in a box") for exactly that pair,
via the `ngModel`/`ngModelChange` input/output pair that `FormsModule`'s `NgModel` directive
exposes. A third example shows pure one-way binding with no path back from the DOM at all.

### `/directives` — Structural & Custom Attribute Directives
- Structural: the built-in `@for`/`@if` control-flow syntax (Angular 17+), including `@for`'s
  required `track` expression and its `@empty` block. Comments explain how this differs from the
  older `*ngFor`/`*ngIf` structural directives (which still work, and desugar to
  `<ng-template>` + a structural directive under the hood).
- Custom attribute directive: `HighlightDirective` (`appHighlight`) uses `@HostListener` for
  `mouseenter`/`mouseleave` and `Renderer2` (not direct `nativeElement` manipulation, so it stays
  platform-agnostic) to toggle a background color, configurable via its own `@Input`.

### `/change-detection` — Change Detection, zone.js, OnPush
A short, honest explanation (as a code comment in `change-detection-demo.component.ts`) of how
Angular's default change detection actually works: zone.js monkey-patches async browser APIs, and
after each one fires, Angular runs `ApplicationRef.tick()`, walking the *entire* component tree
and re-evaluating every binding. Two child components — `DefaultUserCardComponent` (Default
strategy) and `OnPushUserCardComponent` (`ChangeDetectionStrategy.OnPush`) — are bound to the same
`user` object. Two buttons prove the point:
- **Mutate in place** (`user.visits++`, same object reference) updates only the Default card.
- **Replace with a new object** (`user = { ...user, visits: user.visits + 1 }`) updates both,
  because the `@Input` *reference* changed — which is exactly what OnPush checks for, and exactly
  why OnPush requires immutable data patterns rather than in-place mutation.

## Verification

- `ng build` completes with **zero errors and zero warnings** (production build; output in
  `dist/angular-interview-prep/`).
- `ng serve` was started, the root route returned HTTP 200, and the server was stopped afterward —
  no background process was left running.

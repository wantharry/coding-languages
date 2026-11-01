# TypeScript Interview Prep

A demonstration project covering the TypeScript features that actually come
up in senior-software-engineer interviews and real code review — not a full
language-spec dump. Every file is real, compiling, runnable TypeScript, with
comments explaining **why** each feature matters, not just what it does.

## Setup

```bash
npm install
```

That's it — `typescript` and `@types/node` are the only dependencies, both
dev-only.

Two things about this project's setup are themselves worth knowing for an
interview:

- **`package.json` has `"type": "module"`.** Without it, Node refuses to run
  `import`/`export` syntax in a `.ts` file directly (it assumes CommonJS and
  the `import` statement throws a syntax error). This is a real, commonly-hit
  gotcha the first time someone tries Node's native TypeScript execution.
- **`"strict": true` in `tsconfig.json`.** See the comment block at the top
  of that file for the full reasoning — short version: turning strict mode
  on from day one is free; turning it on after a codebase has grown is
  expensive. There's no good reason for a new project in 2026 to skip it.

## Running things

**Type-check the whole project** (zero emitted files, just error-checking):

```bash
npm run typecheck
```

**Run an individual example directly with Node.** Node (22+) can execute
TypeScript files natively by stripping type annotations at load time — no
`ts-node`/`tsx` needed:

```bash
node src/01-interfaces-vs-types.ts
node src/02-generics.ts
node src/03-utility-types.ts
node src/04-unions-intersections-discriminated.ts
node src/05-type-narrowing-guards.ts
node src/08-async-await.ts
node src/09-mapped-conditional-types.ts
node src/10-modules.ts
node src/11-any-unknown-never.ts
```

**Two files can't be run that way** — `06-enums-vs-literals.ts` and
`07-decorators.ts`. Node's native TypeScript support only *strips* type
annotations; it does not transform syntax that needs real code generation
(`enum` bodies, decorator application). Running either directly throws
`ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`. This is a genuine, provable cost of
those two features, and is itself part of what each file teaches. Run them
via `tsc` instead:

```bash
npm run run:enums        # compiles with tsc, then runs the plain JS output
npm run run:decorators    # same idea
```

(Both scripts are thin wrappers: `tsc -p tsconfig.legacy.json && node dist/<file>.js`.)

## Project structure

```
tsconfig.json          strict type-checking config, used by `npm run typecheck`
tsconfig.legacy.json    real-emit config, used only to compile 06 and 07 for execution
package.json
src/
  01-interfaces-vs-types.ts
  02-generics.ts
  03-utility-types.ts
  04-unions-intersections-discriminated.ts
  05-type-narrowing-guards.ts
  06-enums-vs-literals.ts
  07-decorators.ts
  08-async-await.ts
  09-mapped-conditional-types.ts
  10-modules.ts
  11-any-unknown-never.ts
  modules/
    math-utils.ts       named exports, consumed by 10-modules.ts
    logger.ts           default export + one named export, consumed by 10-modules.ts
```

## What each file covers

- **`01-interfaces-vs-types.ts`** — `interface` vs `type`: structural typing
  (TypeScript checks shape, not declared name), declaration merging
  (interface-only), what each syntax can/can't express, and a callable
  interface.
- **`02-generics.ts`** — generic functions, multiple type parameters,
  constraints with `extends` (including the `keyof`-constrained
  property-getter pattern), a generic class (a type-safe stack), default
  type parameters, and a generic higher-order function (a typed memoizer).
- **`03-utility-types.ts`** — `Partial`, `Pick`, `Omit`, `Record`,
  `Readonly`, `ReturnType`/`Parameters`, each with a realistic use case
  (PATCH updates, least-privilege API shapes, exhaustive `Record` keys,
  defensive read-only configs, deriving a type from a function's actual
  signature), plus composing several together.
- **`04-unions-intersections-discriminated.ts`** — plain unions and
  intersections, then the big one: discriminated unions, demonstrated with
  a `Result<T, E>` type (typed failure without exceptions) and a classic
  shape/area example showing **exhaustiveness checking** via a `never`
  fallthrough.
- **`05-type-narrowing-guards.ts`** — `typeof`, `instanceof`, and `in`
  narrowing; custom type predicates (`x is T`) for both a tagged-union case
  and validating genuinely `unknown` data (e.g. parsed JSON); truthiness
  narrowing for `null`/`undefined`.
- **`06-enums-vs-literals.ts`** — numeric `enum` vs a union of string
  literals (`as const` array → `typeof arr[number]`), with the concrete
  type-safety hole in numeric enums demonstrated, what an enum actually
  compiles to, and why most teams now default to literal unions. **Run via
  `npm run run:enums`**, not `node` directly (see above).
- **`07-decorators.ts`** — modern, standard (TC39 Stage 3 / TS 5+) class and
  method decorators: a logging method decorator, a class decorator that
  registers instances, and a decorator *factory* (`@retry(3)`) that takes
  its own configuration. Also notes the legacy/`experimentalDecorators`
  split still found in NestJS/Angular/TypeORM code. **Run via
  `npm run run:decorators`**, not `node` directly.
- **`08-async-await.ts`** — `async function` → `Promise<T>`, `await`
  unwrapping, catching into a typed `Result` instead of throwing,
  `Promise.all` preserving distinct per-element types, `Promise.allSettled`'s
  built-in discriminated union (`status: "fulfilled" | "rejected"`), and
  top-level `await`.
- **`09-mapped-conditional-types.ts`** — hand-rolled versions of
  `Partial`/`Readonly`/`Pick` to show what's actually underneath them; a
  recursive `DeepReadonly`; key-remapping with `as` (`Getters<T>`);
  conditional types with `infer` (a mini `ReturnType` and a recursive
  `Awaited`); distributive conditional types over a union; and extracting a
  union of method names by filtering on value type. This is the file that
  separates "comfortable with generics" from "can read a library's `.d.ts`".
- **`10-modules.ts`** (with `src/modules/math-utils.ts` and
  `src/modules/logger.ts`) — named vs default exports and when each earns
  its place, `import type` for type-only imports (enforced here by
  `verbatimModuleSyntax`), renaming on import, namespace imports, and a note
  on barrel-file re-exports and their tree-shaking cost.
- **`11-any-unknown-never.ts`** — `any` (opts out of checking, and is
  contagious to anything derived from it), `unknown` (same breadth, but
  forces narrowing before use — the type-safe replacement for the places
  people reach for `any` out of habit), and `never` (provably unreachable
  code; assertion functions and exhaustiveness checks).

## Verification performed

- `npx tsc --noEmit -p tsconfig.json` passes with **zero errors** across the
  entire `src/` tree.
- Every file listed as directly runnable was executed with `node` and
  produced correct, inspected output (no runtime errors, no `undefined`
  where a real value was expected).
- `06-enums-vs-literals.ts` and `07-decorators.ts` were compiled with
  `tsc -p tsconfig.legacy.json` and the resulting `dist/*.js` was executed
  with `node`, also producing correct output.

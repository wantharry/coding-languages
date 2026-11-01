/**
 * A small module demonstrating a DEFAULT export, alongside one named
 * export in the SAME file — a common real-world mix: "the main thing this
 * module provides" as default, plus a smaller, related named helper.
 *
 * The senior-level take on default vs named exports (this one IS somewhat
 * opinionated/contested, and worth presenting as such in an interview,
 * not as settled fact):
 *   - A default export's imported name is chosen by the IMPORTER, not the
 *     module — `import Foo from "./logger.ts"` and
 *     `import Bar from "./logger.ts"` both work and both refer to the same
 *     thing. That flexibility is also the downside: it means the name you
 *     see at a call site isn't guaranteed to match the module's own idea
 *     of its name, which hurts searchability and autocomplete consistency
 *     across a large codebase.
 *   - Many style guides (Airbnb's, and TypeScript's own team informally)
 *     now lean towards named-exports-only, specifically BECAUSE of that
 *     rename-ambiguity and because it keeps tooling (auto-import,
 *     rename-symbol) reliable.
 *   - Default exports still make sense for modules with one obvious,
 *     primary thing to export (a single React component per file is the
 *     classic case) — which is the pattern demonstrated here.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export default class Logger {
  // Spelled out rather than as a constructor parameter property, so this
  // module stays runnable directly via `node` — see the note on `Box` in
  // 02-generics.ts for why parameter properties don't survive Node's
  // native, strip-only TypeScript support.
  readonly #namespace: string;

  constructor(namespace: string) {
    this.#namespace = namespace;
  }

  log(level: LogLevel, message: string): void {
    console.log(`[${this.#namespace}] [${level.toUpperCase()}] ${message}`);
  }
}

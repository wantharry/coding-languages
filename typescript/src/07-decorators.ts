/**
 * DECORATORS
 * ===========
 *
 * NOTE ON RUNNING THIS FILE: same situation as 06-enums-vs-literals.ts —
 * decorator syntax (`@something`) is NOT type annotation, it's real syntax
 * that needs real code transformation, so Node's native, strip-only
 * TypeScript support refuses to run this file directly. Use
 * `npm run run:decorators` (compiles with `tsc`, then runs the plain JS
 * output with `node`). See the README for the full explanation.
 *
 * This file uses the modern, STANDARD decorators (the TC39 Stage 3
 * proposal, which shipped as the default in TypeScript 5.0+) rather than
 * the older "experimental"/legacy decorators that Angular and older NestJS
 * code use (those need `"experimentalDecorators": true` in tsconfig and a
 * different signature: `(target, propertyKey, descriptor)` instead of
 * `(value, context)`). Interviewers who ask about decorators are usually
 * probing for ONE of two things:
 *   1. The underlying idea: a decorator is a function that wraps/replaces
 *      a class, method, or field, letting you inject behavior (logging,
 *      caching, validation, DI registration) WITHOUT touching the
 *      decorated code's own body. It's the same idea as a Python decorator
 *      or a Java/C# annotation processed at a meta-level, applied to JS/TS.
 *   2. Whether you know the ecosystem is mid-migration: lots of production
 *      code (NestJS, older Angular, TypeORM) still uses the legacy
 *      experimental form, so "which decorators" is a real, practical
 *      question, not just trivia.
 */

// --- A method decorator: logging ---------------------------------------------
// A standard decorator for a method receives the original method as
// `value` and a `context` object describing what's being decorated
// (its `kind`, `name`, etc). It returns a REPLACEMENT function — the class
// never sees the original method, only whatever the decorator returns.
function logCalls<This, Args extends unknown[], Return>(
  originalMethod: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
): (this: This, ...args: Args) => Return {
  const methodName = String(context.name);
  return function (this: This, ...args: Args): Return {
    console.log(`[log] calling ${methodName}(${args.map((a) => JSON.stringify(a)).join(", ")})`);
    const result = originalMethod.call(this, ...args);
    console.log(`[log] ${methodName} returned ${JSON.stringify(result)}`);
    return result;
  };
}

// --- A class decorator: a tiny registry ------------------------------------
// A class decorator receives the class itself and can return a replacement
// class (e.g. to add functionality) or, as here, just observe it as a
// side effect — a common real pattern for things like dependency-injection
// container registration (`@Injectable()` in Angular/NestJS is exactly
// this shape, using the legacy decorator form).
const registry: string[] = [];
function registerService<Class extends new (...args: never[]) => unknown>(
  target: Class,
  context: ClassDecoratorContext<Class>,
): void {
  registry.push(context.name ?? target.name);
}

@registerService
class PricingService {
  @logCalls
  computeTotal(price: number, taxRate: number): number {
    return Math.round(price * (1 + taxRate) * 100) / 100;
  }
}

const pricing = new PricingService();
console.log("total =", pricing.computeTotal(19.99, 0.08));
console.log("registered services:", registry);

// --- A decorator FACTORY: a decorator that takes its own arguments ---------
// Most real-world decorators (`@Column({ nullable: true })`,
// `@Retry({ times: 3 })`) aren't used bare — they're the RESULT of calling
// a function with configuration, which then returns the actual decorator.
// This is just a function returning a function, same as any other
// higher-order function in file 02, applied to the decorator slot.
function retry(times: number) {
  return function <This, Args extends unknown[], Return>(
    originalMethod: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  ): (this: This, ...args: Args) => Return {
    const methodName = String(context.name);
    return function (this: This, ...args: Args): Return {
      let lastError: unknown;
      for (let attempt = 1; attempt <= times; attempt++) {
        try {
          return originalMethod.call(this, ...args);
        } catch (err) {
          lastError = err;
          console.log(`[retry] ${methodName} failed on attempt ${attempt}/${times}`);
        }
      }
      throw lastError;
    };
  };
}

class FlakyService {
  #attempts = 0;

  @retry(3)
  unreliableOperation(): string {
    this.#attempts += 1;
    if (this.#attempts < 3) {
      throw new Error(`not ready yet (attempt ${this.#attempts})`);
    }
    return "success";
  }
}

console.log("retry result =", new FlakyService().unreliableOperation());

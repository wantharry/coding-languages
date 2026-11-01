import { Injectable } from '@angular/core';

/**
 * LoggerService — the "textbook" singleton service.
 *
 * WHY `providedIn: 'root'` instead of listing it in a module's `providers`
 * array (the pre-Angular-6 way) or a component's `providers` array:
 *
 * 1. Tree-shakable: if nothing in the app ever injects LoggerService, the
 *    Angular compiler can drop it from the production bundle entirely.
 *    A service registered in an NgModule's `providers: [...]` array is
 *    *always* bundled, whether anything uses it or not, because the module
 *    has no way to know in advance.
 * 2. One instance for the whole application (a true singleton), created
 *    lazily the first time something injects it, and reused by every
 *    subsequent injection anywhere in the app — components, other
 *    services, guards, interceptors, etc.
 * 3. No need to remember to add it to a module's `providers` array at all;
 *    the registration lives with the service itself, which is also easier
 *    to refactor (move the file, the registration moves with it).
 *
 * Contrast this with `providers: [SomeService]` on a *component* (see
 * dependency-injection-demo.component.ts for a worked example): Angular's
 * DI is hierarchical — each component with its own `providers` array gets
 * its OWN instance of that service, shared only by that component and its
 * descendants. That's the tool you reach for when you want scoped state
 * (e.g. a wizard's step state) rather than app-wide singleton state.
 */
@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private readonly history: string[] = [];

  log(message: string): void {
    const entry = `[${new Date().toLocaleTimeString()}] ${message}`;
    this.history.push(entry);
    // eslint-disable-next-line no-console
    console.log(entry);
  }

  getHistory(): readonly string[] {
    return this.history;
  }
}

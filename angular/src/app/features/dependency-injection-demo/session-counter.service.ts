import { Injectable } from '@angular/core';

/**
 * SessionCounterService — deliberately NOT `providedIn: 'root'`.
 *
 * This service is registered in the `providers` array of
 * DependencyInjectionDemoComponent (component-level provider), which means:
 *
 * - Angular creates a NEW instance of this service for every instance of
 *   that component (and that instance is shared by the component and all
 *   of ITS children, via the injector hierarchy — a child could inject the
 *   same instance, a sibling route would get a different one).
 * - When the component is destroyed, its injector (and this service
 *   instance) is garbage-collected along with it.
 *
 * This is the pattern for state that should be scoped to "this feature" or
 * "this instance of this component" rather than the whole app — e.g. a
 * multi-step wizard's in-progress state, or (as modeled here) a counter
 * that resets every time you navigate away and back.
 *
 * Contrast with LoggerService (../../core/logger.service.ts), which uses
 * `providedIn: 'root'` precisely because it SHOULD be one shared instance
 * for the entire app.
 */
@Injectable()
export class SessionCounterService {
  private count = 0;

  increment(): number {
    this.count += 1;
    return this.count;
  }

  get value(): number {
    return this.count;
  }
}

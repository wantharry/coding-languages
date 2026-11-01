import { Component } from '@angular/core';
import { LoggerService } from '../../core/logger.service';
import { SessionCounterDisplayComponent } from './session-counter-display.component';
import { SessionCounterService } from './session-counter.service';

/**
 * DependencyInjectionDemoComponent demonstrates both ends of the DI
 * spectrum in one page:
 *
 * 1. `LoggerService` — injected via the constructor, resolved from the
 *    ROOT injector because it's `providedIn: 'root'`. Same instance no
 *    matter where you inject it in the app.
 * 2. `SessionCounterService` — listed in THIS component's own
 *    `providers` array below, which creates a new injector scoped to
 *    this component and its children. Navigate away and back and you get
 *    a fresh instance (count resets to 0); the child
 *    <app-session-counter-display> below gets the SAME instance as this
 *    component, because child components look up their parent's injector
 *    when a provider isn't found locally.
 *
 * WHY constructor injection specifically: Angular's DI resolves
 * constructor parameter types (via TypeScript's design-time metadata,
 * emitted by the compiler) to decide what to instantiate/provide. This
 * happens before anything else runs on the class, which is exactly why
 * injected services ARE available in the constructor — unlike @Input
 * values, which are not. See the lifecycle-demo page for that contrast.
 */
@Component({
  selector: 'app-dependency-injection-demo',
  standalone: true,
  imports: [SessionCounterDisplayComponent],
  providers: [SessionCounterService],
  template: `
    <h2>Dependency Injection: root singletons vs. scoped providers</h2>

    <section>
      <h3>Root singleton — LoggerService</h3>
      <p>
        Injected via the constructor, provided with <code>providedIn: 'root'</code>. Every
        component/service in the app that injects <code>LoggerService</code> gets this exact same
        instance.
      </p>
      <button type="button" (click)="logSomething()">Log a message</button>
      <ul>
        @for (entry of logger.getHistory(); track $index) {
          <li>{{ entry }}</li>
        }
      </ul>
    </section>

    <section>
      <h3>Component-scoped provider — SessionCounterService</h3>
      <p>
        Provided in <em>this component's</em> <code>providers</code> array, not
        <code>providedIn: 'root'</code>. Navigate to another page and back and this count resets,
        because a fresh service instance is created with the fresh component instance.
      </p>
      <button type="button" (click)="counter.increment()">Increment (count: {{ counter.value }})</button>
      <app-session-counter-display />
    </section>
  `,
})
export class DependencyInjectionDemoComponent {
  constructor(
    public logger: LoggerService,
    public counter: SessionCounterService
  ) {}

  logSomething(): void {
    this.logger.log('Hello from DependencyInjectionDemoComponent');
  }
}

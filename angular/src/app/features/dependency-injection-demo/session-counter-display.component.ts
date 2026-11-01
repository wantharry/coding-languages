import { Component } from '@angular/core';
import { SessionCounterService } from './session-counter.service';

/**
 * This child component injects SessionCounterService too, but does NOT
 * list it in its own `providers` array. Angular's DI walks UP the
 * injector tree looking for a provider, finds the one registered on the
 * parent (DependencyInjectionDemoComponent), and hands back THAT same
 * instance. That's what proves this is "component-subtree scoped", not
 * "a new instance every time someone injects it".
 */
@Component({
  selector: 'app-session-counter-display',
  standalone: true,
  template: `
    <p>
      Child component reading the <em>same</em> injected instance: current count =
      <strong>{{ counter.value }}</strong>
    </p>
  `,
})
export class SessionCounterDisplayComponent {
  constructor(public counter: SessionCounterService) {}
}

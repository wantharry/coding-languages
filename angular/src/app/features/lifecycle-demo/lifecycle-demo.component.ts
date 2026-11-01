import { Component } from '@angular/core';
import { LoggerService } from '../../core/logger.service';
import { TickerComponent } from './ticker.component';

@Component({
  selector: 'app-lifecycle-demo',
  standalone: true,
  imports: [TickerComponent],
  template: `
    <h2>Lifecycle Hooks: constructor vs. ngOnInit, and ngOnDestroy cleanup</h2>
    <p>
      Toggle the ticker below on and off. Watch the log: the constructor fires with
      <code>label=""</code> (the &#64;Input isn't bound yet), ngOnInit fires next with the real
      label and starts an RxJS <code>interval()</code> subscription, and ngOnDestroy fires when
      you toggle it off, unsubscribing before the component is destroyed.
    </p>

    <button type="button" (click)="showTicker = !showTicker">
      {{ showTicker ? 'Destroy ticker (triggers ngOnDestroy)' : 'Create ticker' }}
    </button>

    @if (showTicker) {
      <app-ticker label="Demo Ticker" />
    }

    <h3>Lifecycle log</h3>
    <ol>
      @for (entry of logger.getHistory(); track $index) {
        <li>{{ entry }}</li>
      }
    </ol>
  `,
})
export class LifecycleDemoComponent {
  showTicker = false;

  constructor(public logger: LoggerService) {}
}

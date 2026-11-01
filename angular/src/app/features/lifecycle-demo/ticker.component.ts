import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { LoggerService } from '../../core/logger.service';

/**
 * TickerComponent exists to make two classic senior-interview questions
 * concrete instead of abstract:
 *
 * 1. "Why does Angular have both a constructor AND ngOnInit — why not just
 *    do everything in the constructor?"
 *    - The constructor is a plain TypeScript/JS constructor. Angular uses
 *      it ONLY to inject dependencies (see dependency-injection-demo).
 *      At the time it runs, Angular has NOT yet set this component's
 *      @Input-bound properties — `label` below is undefined inside the
 *      constructor.
 *    - ngOnInit runs once, right after Angular has set the initial
 *      @Input values for the FIRST time (and after the component's own
 *      view — but not necessarily children's views — has been checked
 *      the first time). It's the correct place for "setup that depends on
 *      @Input data", like kicking off this subscription, an HTTP call
 *      that needs an id passed in from the parent, etc.
 *    - Put input-dependent logic in the constructor and it silently uses
 *      `undefined`/stale data — a bug that only shows up once you wire
 *      the component into a real parent that passes real data.
 *
 * 2. "Why does ngOnDestroy matter, and what happens if you forget it?"
 *    - This component subscribes to an RxJS `interval()` — an Observable
 *      that, left unsubscribed, keeps firing (and keeps a reference to
 *      this component alive) forever, even after the component is
 *      removed from the DOM. That's a classic memory leak and a classic
 *      "ExpressionChangedAfterChecked"/zombie-update bug in real apps.
 *    - ngOnDestroy is Angular's guaranteed last call before a component
 *      is torn down (route change, *ngIf/@if toggling off, etc.) — it's
 *      where you MUST release anything with its own lifetime: RxJS
 *      subscriptions, setInterval/setTimeout handles, WebSocket
 *      connections, DOM event listeners added manually, etc.
 */
@Component({
  selector: 'app-ticker',
  standalone: true,
  template: `
    <p class="ticker">
      <strong>{{ label }}</strong> — ticks: {{ ticks }}
    </p>
  `,
  styles: [
    `
      .ticker {
        padding: 0.5rem 0.75rem;
        background: #eef2ff;
        border-radius: 6px;
        display: inline-block;
      }
    `,
  ],
})
export class TickerComponent implements OnInit, OnDestroy {
  @Input() label = '';

  ticks = 0;

  private tickSubscription?: Subscription;

  constructor(private readonly logger: LoggerService) {
    // `label` is still '' (its default) here — the @Input binding from
    // the parent hasn't been applied yet. Try logging `this.label` and
    // watch it be wrong/empty in the console.
    this.logger.log(`TickerComponent constructor: label="${this.label}" (not yet bound)`);
  }

  ngOnInit(): void {
    // By now Angular HAS applied the @Input binding, so `label` holds
    // the real value the parent passed in.
    this.logger.log(`TickerComponent ngOnInit: label="${this.label}" (now bound) — subscribing`);
    this.tickSubscription = interval(1000).subscribe(() => {
      this.ticks += 1;
    });
  }

  ngOnDestroy(): void {
    // Without this, the interval() subscription above would keep firing
    // forever, holding a reference to this component instance and
    // leaking memory every time the ticker is toggled off and on.
    this.tickSubscription?.unsubscribe();
    this.logger.log('TickerComponent ngOnDestroy: unsubscribed from interval()');
  }
}

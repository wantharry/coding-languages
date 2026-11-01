import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DemoUser } from './user-card.component';

/**
 * OnPushUserCardComponent opts into `ChangeDetectionStrategy.OnPush`.
 *
 * With OnPush, Angular SKIPS checking this component's view during a
 * normal change-detection run UNLESS one of these specifically marks it
 * dirty again:
 *   1. One of its @Input *references* changes (`===` comparison — a
 *      mutated-in-place object is the SAME reference, so this does NOT
 *      count).
 *   2. An event originates from inside this component's own template
 *      (e.g. a `(click)` bound in ITS template, not a parent's).
 *   3. It's explicitly marked dirty via `ChangeDetectorRef.markForCheck()`
 *      (or `.detectChanges()`), e.g. from an RxJS subscription callback.
 *   4. A signal read in its template changes (Angular 16+ signals
 *      integrate with OnPush specifically to solve this cleanly without
 *      needing markForCheck at all).
 *   5. The `async` pipe is used in its template on an Observable/Promise
 *      binding — the async pipe calls markForCheck() for you internally.
 *
 * THIS IS WHY ONPUSH FORCES IMMUTABLE DATA PATTERNS: if the parent
 * mutates `user.visits++` in place and hands this component the exact
 * same object reference again, Angular's OnPush check sees
 * `oldRef === newRef` and concludes "nothing to do" — even though the
 * object's contents changed. The fix is always to produce a NEW object/
 * array reference for anything that changed (`{ ...user, visits:
 * user.visits + 1 }`), which is exactly the pattern used throughout this
 * whole demo project already (see components-demo's cart array, for
 * example) — OnPush is the reason that discipline matters, not just
 * style preference.
 */
@Component({
  selector: 'app-onpush-user-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card onpush">
      <h4>OnPush strategy</h4>
      <p>{{ user.name }} — {{ user.visits }} visit(s)</p>
    </div>
  `,
  styles: [
    `
      .card {
        border-radius: 6px;
        padding: 0.75rem 1rem;
        display: inline-block;
      }
      .onpush {
        background: #dbeafe;
      }
    `,
  ],
})
export class OnPushUserCardComponent {
  @Input({ required: true }) user!: DemoUser;
}

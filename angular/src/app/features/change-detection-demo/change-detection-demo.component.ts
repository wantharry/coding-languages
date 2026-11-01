import { Component } from '@angular/core';
import { DefaultUserCardComponent, DemoUser } from './user-card.component';
import { OnPushUserCardComponent } from './onpush-user-card.component';

/**
 * ChangeDetectionDemoComponent — the "honest short explanation" of how
 * Angular's change detection works, made concrete.
 *
 * HOW IT ACTUALLY WORKS (classic zone.js setup, which is what this
 * project uses — `provideZoneChangeDetection` in app.config.ts):
 *
 * 1. Zone.js monkey-patches essentially every async browser API
 *    (addEventListener, setTimeout/setInterval, Promise callbacks, XHR/
 *    fetch) when the app bootstraps. Every one of those patched APIs,
 *    when it fires, now runs INSIDE an Angular-aware "zone".
 * 2. After any such task finishes, zone.js notifies Angular
 *    (`NgZone.onMicrotaskEmpty`), and Angular responds by running a
 *    single change-detection pass: `ApplicationRef.tick()`.
 * 3. `tick()` walks the ENTIRE component tree, top to bottom, and for
 *    each component checks: "has anything this component's template
 *    reads changed since last time?" — re-evaluating every template
 *    expression/binding and patching the real DOM where the result
 *    differs. This is why Angular CD is described as "dirty checking by
 *    re-evaluation" rather than fine-grained reactive tracking like
 *    Signals/Vue/Solid use.
 * 4. `ChangeDetectionStrategy.Default` means: always include this
 *    component in that walk, unconditionally, every single tick.
 *    `ChangeDetectionStrategy.OnPush` means: skip this component's
 *    subtree during the walk UNLESS it's been explicitly marked dirty
 *    (new @Input reference, an event from inside its own template,
 *    markForCheck(), a changed signal it reads, or the async pipe) — see
 *    onpush-user-card.component.ts for the exact dirty-marking triggers.
 *
 * WHY THIS MATTERS AT SENIOR LEVEL: in a large app, Default-everywhere
 * means EVERY component's EVERY binding gets re-evaluated on EVERY
 * browser event anywhere in the app, even a totally unrelated mousemove.
 * That's the actual performance cost interviewers are probing when they
 * ask about change detection — and OnPush (or, increasingly, Angular's
 * newer Signals-based reactivity and zoneless change detection) is the
 * actual fix, not "add more ngIf's".
 */
@Component({
  selector: 'app-change-detection-demo',
  standalone: true,
  imports: [DefaultUserCardComponent, OnPushUserCardComponent],
  template: `
    <h2>Change Detection: zone.js, Default vs. OnPush</h2>

    <p>
      Both cards below are bound to the <em>same</em> <code>user</code> object. Try each button
      and watch which card updates:
    </p>

    <div class="buttons">
      <button type="button" (click)="mutateInPlace()">
        Mutate in place (<code>user.visits++</code>, same reference)
      </button>
      <button type="button" (click)="replaceWithNewObject()">
        Replace with a new object (<code>user = {{ '{' }} ...user, visits: user.visits + 1 {{ '}' }}</code>)
      </button>
    </div>

    <div class="cards">
      <app-default-user-card [user]="user" />
      <app-onpush-user-card [user]="user" />
    </div>

    <p class="note">
      "Mutate in place" updates the Default card (it re-checks everything, every tick) but NOT
      the OnPush card — same object reference in, so OnPush's reference check says "nothing
      changed" and skips re-rendering. "Replace with a new object" updates BOTH, because now the
      &#64;Input reference itself is different, which is exactly the signal OnPush is watching for.
    </p>
  `,
  styles: [
    `
      .buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin: 1rem 0;
      }
      .cards {
        margin: 1rem 0;
      }
      .note {
        color: #555;
        font-size: 0.85rem;
        max-width: 640px;
      }
    `,
  ],
})
export class ChangeDetectionDemoComponent {
  user: DemoUser = { name: 'Ada Lovelace', visits: 0 };

  mutateInPlace(): void {
    // Same object reference — only the Default-strategy card will show
    // the new visit count after this.
    this.user.visits++;
  }

  replaceWithNewObject(): void {
    // A brand-new object reference — both cards update, including the
    // OnPush one, because its @Input reference actually changed.
    this.user = { ...this.user, visits: this.user.visits + 1 };
  }
}

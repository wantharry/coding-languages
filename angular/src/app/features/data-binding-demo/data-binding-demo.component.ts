import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * DataBindingDemoComponent: one-way vs. two-way binding, and what
 * [(ngModel)] actually is under the hood.
 *
 * ONE-WAY bindings (the vast majority of real templates):
 * - Property binding `[value]="x"` — data flows component -> DOM. Angular
 *   sets the DOM property (not the HTML *attribute* — an important
 *   distinction interviewers like to probe: `[value]` sets the `.value`
 *   JS property on the element, it does not rewrite the `value="..."`
 *   HTML attribute you'd see in dev tools).
 * - Event binding `(input)="x = $event..."` — data flows DOM -> component,
 *   triggered by a browser event.
 *
 * TWO-WAY binding `[(ngModel)]="x"` is NOT a separate binding mechanism —
 * it's syntactic sugar ("banana in a box": `[( )]` looks like a banana in
 * a box) that Angular's template compiler expands into exactly the two
 * one-way bindings above, combined:
 *
 *     [(ngModel)]="name"
 *     ≡
 *     [ngModel]="name" (ngModelChange)="name = $event"
 *
 * `ngModel` here is a directive (from FormsModule) that: (a) accepts the
 * current value as a `@Input() ngModel`, writes it into the form control
 * element, and (b) listens for the element's native input events and
 * re-emits the new value through its OWN `@Output() ngModelChange`. The
 * manual, un-sugared block in this demo reimplements exactly that pair of
 * bindings by hand, with a plain `[value]`/`(input)` pair, to make the
 * equivalence concrete rather than "magic".
 *
 * You can build this same two-way pattern yourself on a custom component
 * by exposing `@Input() x` + `@Output() xChange` — Angular's compiler
 * recognizes the `xChange` naming convention and lets you write
 * `[(x)]="y"` on YOUR component too, which is worth mentioning as the
 * "how do you make your own component support banana-in-a-box" follow-up.
 */
@Component({
  selector: 'app-data-binding-demo',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h2>Data Binding: one-way vs. two-way ([(ngModel)])</h2>

    <section>
      <h3>Two-way binding with [(ngModel)]</h3>
      <input [(ngModel)]="twoWayName" placeholder="Type your name" />
      <p>Hello, <strong>{{ twoWayName || '…' }}</strong></p>
    </section>

    <section>
      <h3>The same thing, written out as the two one-way bindings it expands to</h3>
      <input [value]="manualName" (input)="manualName = inputValue($event)" placeholder="Type your name" />
      <p>Hello, <strong>{{ manualName || '…' }}</strong></p>
      <p class="note">
        No <code>ngModel</code> directive involved here at all — just a property binding
        pushing data IN and an event binding pulling data OUT, kept in sync by hand. This is
        exactly what <code>[(ngModel)]</code> does for you automatically.
      </p>
    </section>

    <section>
      <h3>Pure one-way binding (no way back from the DOM)</h3>
      <p [textContent]="readOnlyMessage"></p>
      <button type="button" (click)="readOnlyMessage = 'Updated at ' + (currentTime())">
        Update via component (one direction: component → DOM)
      </button>
    </section>
  `,
  styles: [
    `
      section {
        margin-bottom: 1.5rem;
      }
      .note {
        color: #555;
        font-size: 0.85rem;
      }
    `,
  ],
})
export class DataBindingDemoComponent {
  twoWayName = '';
  manualName = '';
  readOnlyMessage = 'This text only ever changes because the component code changes it.';

  inputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  currentTime(): string {
    return new Date().toLocaleTimeString();
  }
}

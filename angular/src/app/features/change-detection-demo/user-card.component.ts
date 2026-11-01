import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface DemoUser {
  name: string;
  visits: number;
}

/**
 * DefaultUserCardComponent uses Angular's DEFAULT change detection
 * strategy: on every change-detection run (triggered by zone.js after
 * essentially any async browser event — click, setTimeout, XHR/fetch
 * resolution, promise resolution, etc.), Angular walks into THIS
 * component and re-checks every binding in its template, regardless of
 * whether anything it depends on actually changed. That's why it reflects
 * an in-place mutation of the SAME `user` object reference just fine —
 * the view is unconditionally re-rendered(checked) on the next tick no
 * matter what.
 */
@Component({
  selector: 'app-default-user-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="card default">
      <h4>Default strategy</h4>
      <p>{{ user.name }} — {{ user.visits }} visit(s)</p>
    </div>
  `,
  styles: [
    `
      .card {
        border-radius: 6px;
        padding: 0.75rem 1rem;
        display: inline-block;
        margin-right: 1rem;
      }
      .default {
        background: #fef3c7;
      }
    `,
  ],
})
export class DefaultUserCardComponent {
  @Input({ required: true }) user!: DemoUser;
}

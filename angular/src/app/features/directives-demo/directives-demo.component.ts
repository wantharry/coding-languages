import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HighlightDirective } from './highlight.directive';

interface Language {
  name: string;
  typed: boolean;
}

/**
 * DirectivesDemoComponent covers both directive categories interviewers
 * expect you to be able to name and tell apart:
 *
 * - STRUCTURAL directives change the shape of the DOM — they add, remove,
 *   or repeat elements. `*ngIf`/`*ngFor` were the classic structural
 *   directives (they still exist and work); this demo uses the newer
 *   built-in control-flow syntax (`@if`, `@for`), which Angular 17+
 *   compiles directly rather than desugaring to `<ng-template>` +
 *   structural directives. It's worth being able to explain BOTH: that
 *   `*ngFor="let x of items"` desugars to an `<ng-template>` wrapped with
 *   `NgForOf`, and that `@for` is the modern replacement that the
 *   compiler understands natively (better type-checking, no need to
 *   import `CommonModule`/`NgFor`, and — unlike `*ngFor` — `@for` REQUIRES
 *   a `track` expression, which forces you to think about identity/perf
 *   from day one).
 * - ATTRIBUTE directives (see highlight.directive.ts) decorate an
 *   existing element instead of adding/removing elements.
 */
@Component({
  selector: 'app-directives-demo',
  standalone: true,
  imports: [FormsModule, HighlightDirective],
  template: `
    <h2>Directives: structural (&#64;for/&#64;if) + a custom attribute directive</h2>

    <section>
      <h3>Structural: &#64;for with track, and &#64;if/&#64;else</h3>
      <label>
        <input type="checkbox" [(ngModel)]="showOnlyTyped" />
        Show only typed languages
      </label>

      <ul>
        @for (lang of visibleLanguages(); track lang.name) {
          <li>{{ lang.name }} <em>({{ lang.typed ? 'typed' : 'dynamic' }})</em></li>
        } @empty {
          <li><em>No languages match the current filter.</em></li>
        }
      </ul>

      @if (visibleLanguages().length === 0) {
        <p class="note">(The &#64;empty block above already covers this, &#64;if is just for comparison.)</p>
      }
    </section>

    <section>
      <h3>Custom attribute directive: appHighlight</h3>
      <p class="note">Hover each line — the directive adds a background on mouseenter and removes it on mouseleave, entirely via its own &#64;HostListener handlers.</p>
      <p appHighlight>Default highlight color.</p>
      <p appHighlight="#c7f0db">Custom highlight color, passed as the directive's own &#64;Input.</p>
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
      p[appHighlight] {
        padding: 0.4rem 0.6rem;
        border: 1px dashed #ccc;
        border-radius: 4px;
        width: fit-content;
      }
    `,
  ],
})
export class DirectivesDemoComponent {
  showOnlyTyped = false;

  languages: Language[] = [
    { name: 'TypeScript', typed: true },
    { name: 'JavaScript', typed: false },
    { name: 'Java', typed: true },
    { name: 'Python', typed: false },
  ];

  visibleLanguages(): Language[] {
    return this.showOnlyTyped ? this.languages.filter((l) => l.typed) : this.languages;
  }
}

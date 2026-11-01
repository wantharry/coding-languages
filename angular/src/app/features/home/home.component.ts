import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h2>What's in here</h2>
    <p>
      Each link in the top nav is a small, self-contained, working example of a concept that
      comes up constantly in senior Angular interviews. The point isn't to show off a feature —
      it's to show <em>why</em> it exists and what breaks if you get it wrong. Read the source
      files (not just this rendered page); the comments carry most of the explanation.
    </p>
    <ul>
      <li>
        <a routerLink="/components">Components &amp; &#64;Input/&#64;Output</a> — a parent/child pair,
        data flowing down, events flowing up.
      </li>
      <li>
        <a routerLink="/dependency-injection">DI &amp; Services</a> — constructor injection,
        <code>providedIn: 'root'</code> singletons vs. component-scoped providers.
      </li>
      <li>
        <a routerLink="/lifecycle">Lifecycle Hooks</a> — constructor vs.
        <code>ngOnInit</code>, and <code>ngOnDestroy</code> cleanup.
      </li>
      <li>
        <a routerLink="/rxjs">RxJS Basics</a> — Observables, subscribe/unsubscribe, map/filter/
        switchMap.
      </li>
      <li>
        <a routerLink="/data-binding">Data Binding</a> — one-way vs. two-way binding, and what
        <code>[(ngModel)]</code> expands to.
      </li>
      <li>
        <a routerLink="/directives">Directives</a> — the built-in <code>&#64;for</code>/<code
          >&#64;if</code
        >
        control flow and a custom attribute directive.
      </li>
      <li>
        <a routerLink="/change-detection">Change Detection</a> — zone.js, Default vs.
        <code>OnPush</code>, and why OnPush demands immutable data.
      </li>
    </ul>
  `,
})
export class HomeComponent {}

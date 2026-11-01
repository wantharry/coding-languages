import { Routes } from '@angular/router';

/**
 * Each route lazy-loads a standalone component with `loadComponent`.
 * This is the modern (Angular 15+) replacement for lazy-loaded NgModules:
 * every demo page below ships in its own JS chunk that the browser only
 * downloads when the user navigates to it — worth mentioning in an
 * interview as the current best practice for route-level code splitting.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'components',
    loadComponent: () =>
      import('./features/components-demo/components-demo.component').then(
        (m) => m.ComponentsDemoComponent
      ),
  },
  {
    path: 'dependency-injection',
    loadComponent: () =>
      import('./features/dependency-injection-demo/dependency-injection-demo.component').then(
        (m) => m.DependencyInjectionDemoComponent
      ),
  },
  {
    path: 'lifecycle',
    loadComponent: () =>
      import('./features/lifecycle-demo/lifecycle-demo.component').then(
        (m) => m.LifecycleDemoComponent
      ),
  },
  {
    path: 'rxjs',
    loadComponent: () =>
      import('./features/rxjs-demo/rxjs-demo.component').then((m) => m.RxjsDemoComponent),
  },
  {
    path: 'data-binding',
    loadComponent: () =>
      import('./features/data-binding-demo/data-binding-demo.component').then(
        (m) => m.DataBindingDemoComponent
      ),
  },
  {
    path: 'directives',
    loadComponent: () =>
      import('./features/directives-demo/directives-demo.component').then(
        (m) => m.DirectivesDemoComponent
      ),
  },
  {
    path: 'change-detection',
    loadComponent: () =>
      import('./features/change-detection-demo/change-detection-demo.component').then(
        (m) => m.ChangeDetectionDemoComponent
      ),
  },
  { path: '**', redirectTo: '' },
];

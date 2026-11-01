import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

/**
 * Root shell: just navigation + a <router-outlet>. Every concept below is
 * demonstrated in its own routed, lazy-loaded standalone component so each
 * page can be read (and tested) in isolation. See the project README for a
 * map of which route demonstrates which interview topic.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'angular-interview-prep';
}

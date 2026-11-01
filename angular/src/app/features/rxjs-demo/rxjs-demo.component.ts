import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MockBackendService, User } from './mock-backend.service';

/**
 * RxjsDemoComponent walks through the RxJS vocabulary that comes up in
 * almost every senior Angular interview:
 *
 * - Observable + subscribe(): `fetchUsers()` returns a cold Observable
 *   that does nothing until `.subscribe()` is called — nothing runs
 *   "eagerly" the way a Promise's executor does.
 * - unsubscribe() / ngOnDestroy: the clock subscription below never
 *   completes on its own (interval() fires forever), so it MUST be torn
 *   down manually or it leaks. The one-shot `fetchUsers()`/`searchUsers()`
 *   calls technically complete on their own and wouldn't leak, but we
 *   still track and clean up all subscriptions here as a matter of
 *   discipline — in a bigger component, which ones self-complete isn't
 *   always obvious at a glance, and `Subscription` composition
 *   (`.add(...)`) is cheap.
 * - Operators: `map`/`filter`-style transforms live in the service; this
 *   component demonstrates `switchMap`, the one senior interviewers
 *   specifically like to probe, because misusing it (reaching for
 *   `mergeMap` instead, say) is a real, common source of race-condition
 *   bugs in typeahead-search UIs.
 */
@Component({
  selector: 'app-rxjs-demo',
  standalone: true,
  template: `
    <h2>RxJS Basics</h2>

    <section>
      <h3>1. Observable + subscribe (simulated HTTP GET)</h3>
      <button type="button" (click)="loadUsers()">Fetch active users</button>
      @if (loadingUsers) {
        <p><em>Loading…</em></p>
      }
      @if (activeUserNames.length > 0) {
        <ul>
          @for (name of activeUserNames; track name) {
            <li>{{ name }}</li>
          }
        </ul>
      }
    </section>

    <section>
      <h3>2. switchMap — typeahead search that cancels stale requests</h3>
      <input
        type="text"
        placeholder="Search users…"
        (input)="onSearchInput($event)"
      />
      @if (searching) {
        <p><em>Searching…</em></p>
      }
      <ul>
        @for (user of searchResults; track user.id) {
          <li>{{ user.name }}</li>
        }
      </ul>
      <p class="note">
        Type quickly: thanks to <code>debounceTime</code> + <code>switchMap</code>, only the
        search for your LAST keystroke's term actually resolves and renders — any
        still-in-flight earlier search is cancelled, so a slow early response can never overwrite
        a newer result. (Try <code>mergeMap</code> instead in your head: every keystroke's
        response would race to render, and an old slow one could "win" and show stale results.)
      </p>
    </section>

    <section>
      <h3>3. A live stream you must unsubscribe from</h3>
      <p>Server clock: <strong>{{ serverTime }}</strong></p>
      <p class="note">
        Backed by <code>interval()</code>, which never completes on its own. Navigate away from
        this page and ngOnDestroy below unsubscribes it — open the browser console and you will
        NOT see further ticks logged after leaving.
      </p>
    </section>
  `,
  styles: [
    `
      section {
        margin-bottom: 2rem;
      }
      .note {
        color: #555;
        font-size: 0.85rem;
      }
    `,
  ],
})
export class RxjsDemoComponent implements OnInit, OnDestroy {
  loadingUsers = false;
  activeUserNames: string[] = [];

  searching = false;
  searchResults: User[] = [];
  private readonly searchTerm$ = new Subject<string>();

  serverTime = '';

  // Subscription.add(...) lets us compose multiple subscriptions into one
  // handle so ngOnDestroy only has to call unsubscribe() once.
  private readonly subscriptions = new Subscription();

  constructor(private readonly backend: MockBackendService) {}

  ngOnInit(): void {
    // Wire up the search pipeline once. Each operator has a specific job:
    // - debounceTime(300): ignore keystrokes until typing pauses for
    //   300ms, so we don't fire a request per character.
    // - distinctUntilChanged(): skip re-running the search if the
    //   (debounced) term didn't actually change.
    // - switchMap(term => backend.searchUsers(term)): for each new term,
    //   subscribe to a NEW search Observable and automatically unsubscribe
    //   from (cancel) whatever previous search Observable was still
    //   pending. This is the crux of "why switchMap for typeahead".
    this.subscriptions.add(
      this.searchTerm$
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((term) => {
            this.searching = true;
            return this.backend.searchUsers(term);
          })
        )
        .subscribe((users) => {
          this.searching = false;
          this.searchResults = users;
        })
    );

    this.subscriptions.add(
      this.backend.serverClock().subscribe((time) => {
        this.serverTime = time;
      })
    );
  }

  loadUsers(): void {
    this.loadingUsers = true;
    // A one-shot subscription for a one-shot (completing) Observable.
    // We still don't need to store/unsubscribe this one manually because
    // it completes after emitting once — but seeing it alongside the
    // clock subscription (which does need manual cleanup) is the point:
    // know WHICH of your subscriptions actually need teardown.
    this.backend.fetchActiveUserNames().subscribe((names) => {
      this.activeUserNames = names;
      this.loadingUsers = false;
    });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm$.next(value);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

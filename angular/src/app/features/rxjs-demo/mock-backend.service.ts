import { Injectable } from '@angular/core';
import { Observable, interval, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  active: boolean;
}

const USERS: User[] = [
  { id: 1, name: 'Ada Lovelace', active: true },
  { id: 2, name: 'Alan Turing', active: true },
  { id: 3, name: 'Grace Hopper', active: false },
  { id: 4, name: 'Margaret Hamilton', active: true },
];

/**
 * MockBackendService stands in for a real HTTP backend so this demo has
 * no network dependency, but the RxJS usage is exactly what you'd write
 * against Angular's HttpClient (which also returns Observables).
 */
@Injectable({ providedIn: 'root' })
export class MockBackendService {
  /**
   * Simulates `http.get<User[]>('/api/users')`. `of([...])` emits the
   * array once and completes — `delay(600)` just makes the async nature
   * visible in the UI (a loading state briefly shows).
   */
  fetchUsers(): Observable<User[]> {
    return of(USERS).pipe(delay(600));
  }

  /**
   * Same source data, but piped through two `map` operators chained
   * together: one narrows to active users, the next projects
   * User[] -> string[] of names. This is the bread-and-butter RxJS
   * pattern: operators transform a stream declaratively without ever
   * touching the original source or requiring a manual
   * subscribe-then-loop-then-resubscribe dance.
   */
  fetchActiveUserNames(): Observable<string[]> {
    return this.fetchUsers().pipe(
      map((users) => users.filter((u) => u.active)),
      map((activeUsers) => activeUsers.map((u) => u.name))
    );
  }

  /**
   * Simulates a server-side search endpoint, e.g.
   * `http.get<User[]>('/api/users?q=' + term)`. Deliberately returns a
   * FRESH Observable (with its own delay) each call, which is exactly
   * what makes `switchMap` the right operator for a typeahead search —
   * see RxjsDemoComponent, which pipes keystrokes through `switchMap` so
   * that a new search cancels any still-in-flight previous one.
   */
  searchUsers(term: string): Observable<User[]> {
    const needle = term.trim().toLowerCase();
    const matches = needle
      ? USERS.filter((u) => u.name.toLowerCase().includes(needle))
      : USERS;
    return of(matches).pipe(delay(400));
  }

  /**
   * A never-completing stream, standing in for a live "server clock" /
   * websocket feed. interval() is itself the kind of Observable that
   * MUST be unsubscribed (see RxjsDemoComponent's ngOnDestroy) because it
   * fires forever by design.
   */
  serverClock(): Observable<string> {
    return interval(1000).pipe(map(() => new Date().toLocaleTimeString()));
  }
}

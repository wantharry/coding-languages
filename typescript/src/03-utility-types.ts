/**
 * UTILITY TYPES: Partial, Pick, Omit, Record, Readonly, ReturnType
 * ==================================================================
 *
 * These ship in `lib.es5.d.ts` and are built from the mapped/conditional
 * type features covered in file 09 — they aren't magic, they're just the
 * most useful examples of those features, pre-written for you. Knowing
 * WHEN to reach for each one (instead of hand-rolling an interface) is what
 * separates "has memorized the names" from "uses them correctly in review".
 */

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
}

// --- Partial<T>: "some/all fields optional" --------------------------------
// Real use case: a PATCH-style update function. The caller shouldn't have
// to resupply every field just to change one — but the function body still
// gets full autocomplete and type-checking on whichever fields ARE passed.
function updateUser(user: User, patch: Partial<User>): User {
  return { ...user, ...patch };
}

const existing: User = { id: "u1", name: "Alice", email: "a@example.com", role: "member" };
const promoted = updateUser(existing, { role: "admin" });
console.log("updateUser (promote) =", promoted);

// --- Pick<T, K>: "a narrower view of T, for a specific consumer" -----------
// Real use case: an API response or UI component should only ever see the
// fields it actually needs — this is the TypeScript expression of the
// principle of least privilege applied to data shapes. If `User` later
// grows a `passwordHash` field, `PublicUserSummary` is still safe because
// it was never allowed to include it in the first place.
type PublicUserSummary = Pick<User, "id" | "name">;

function renderUserBadge(user: PublicUserSummary): string {
  return `#${user.id} ${user.name}`;
}
console.log("renderUserBadge =", renderUserBadge(existing));

// --- Omit<T, K>: the inverse of Pick — "T minus these fields" --------------
// Real use case: a "create" DTO where the server generates `id`, so the
// client-supplied payload must NOT include it. `Omit` keeps this in sync
// with `User` automatically — add a field to `User` and `NewUserInput`
// picks it up for free, with no separate type to maintain and drift.
type NewUserInput = Omit<User, "id">;

function createUser(input: NewUserInput): User {
  return { id: crypto.randomUUID(), ...input };
}
const created = createUser({ name: "Bob", email: "b@example.com", role: "member" });
console.log("createUser =", created);

// --- Record<K, V>: "a map from a known key set to a value type" -----------
// Real use case: anywhere you'd reach for `{ [key: string]: V }` but the
// keys are actually a closed, known set — `Record` makes that set explicit
// and lets TypeScript check EXHAUSTIVENESS: if a new role is added to the
// union below, this Record literal fails to compile until it's handled.
type Role = "admin" | "member" | "guest";
const rolePermissions: Record<Role, readonly string[]> = {
  admin: ["read", "write", "delete"],
  member: ["read", "write"],
  guest: ["read"],
};
console.log("rolePermissions.member =", rolePermissions.member);

// --- Readonly<T>: "freeze the shape at the type level" ----------------------
// Real use case: defensive APIs. A function that accepts `Readonly<Config>`
// documents, at the type level, that it will not (and structurally cannot,
// per the compiler) mutate the object it was handed — the caller doesn't
// need to defensively clone before calling it. Note this is COMPILE-TIME
// only: `Object.freeze` is the runtime equivalent, and the two are often
// used together for a belt-and-suspenders guarantee.
interface Config {
  retries: number;
  timeoutMs: number;
}
function describeConfig(config: Readonly<Config>): string {
  // config.retries = 10; // compile error if uncommented — that's the point
  return `retries=${config.retries}, timeoutMs=${config.timeoutMs}`;
}
console.log(describeConfig({ retries: 3, timeoutMs: 5000 }));

// --- ReturnType<F> + Parameters<F>: deriving types FROM a function ----------
// Real use case: you often don't control the function (it's from a
// library, or it's complex enough that duplicating its return shape by
// hand would drift out of sync). `ReturnType` lets you say "whatever that
// function returns" and stay correct automatically if its implementation
// changes shape later.
function fetchUserFromDb(id: string): { id: string; name: string; fetchedAt: Date } {
  return { id, name: "placeholder", fetchedAt: new Date() };
}
type DbUser = ReturnType<typeof fetchUserFromDb>;
type FetchUserArgs = Parameters<typeof fetchUserFromDb>;

function logDbUser(user: DbUser): void {
  console.log(`DbUser(${user.id}) fetched at ${user.fetchedAt.toISOString()}`);
}
const fetchArgs: FetchUserArgs = ["u99"];
logDbUser(fetchUserFromDb(...fetchArgs));

// --- Combining utility types: the realistic case ----------------------------
// In real code these compose. Here: a public, read-only summary built from
// `User` minus its sensitive fields, derived in one line instead of a
// hand-maintained duplicate interface.
type UserListItem = Readonly<Pick<User, "id" | "name" | "role">>;
const listItem: UserListItem = { id: existing.id, name: existing.name, role: existing.role };
console.log("UserListItem =", listItem);

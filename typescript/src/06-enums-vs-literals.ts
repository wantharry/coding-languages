/**
 * ENUMS vs UNIONS OF STRING LITERALS
 * =====================================
 *
 * NOTE ON RUNNING THIS FILE: unlike every other file in this project, you
 * cannot run this one with `node src/06-enums-vs-literals.ts` directly.
 * Node's native TypeScript support only STRIPS type annotations; a numeric
 * `enum` compiles down to real runtime code (an object with forward AND
 * reverse lookups — see the "what enum actually compiles to" section
 * below), which requires actual code generation, not erasure. Node refuses
 * with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` rather than silently doing the
 * wrong thing. Run `npm run run:enums` instead, which compiles this file
 * with real `tsc` first. This limitation is itself part of the lesson: it's
 * a concrete, provable cost of `enum` that a literal union doesn't have.
 *
 * The senior-level opinion (and it IS an opinion, but a well-supported one
 * — this is current mainstream TypeScript guidance, including from the
 * TS team itself): prefer a union of string literals over `enum` for new
 * code. Reasons, in order of how often they bite in real codebases:
 *
 * 1. Numeric enums are NOT type-safe the way you'd expect. Any `number` is
 *    assignable to a numeric enum type — TypeScript does not restrict it to
 *    the declared members. A literal union has no such hole.
 * 2. `enum` generates actual runtime JS (a reverse-mapping object for
 *    numeric enums), which costs bundle size for something a union of
 *    literals compiles to NOTHING — it's erased entirely, like every other
 *    type-only construct.
 * 3. `enum` is a value AND a type with the same name, which is a sharp edge
 *    for anyone used to "types erase, values don't". Literal unions keep
 *    that line clean.
 * 4. `enum` doesn't interoperate as naturally with plain JS/JSON — a value
 *    coming from an API response is a plain string; matching it against an
 *    `enum` member needs `as` or `Enum[key]`, whereas a literal union just
 *    *is* a string, so `response.status === "active"` already works.
 *
 * Where `enum` still earns its place: `const enum` (which DOES fully erase,
 * at the cost of being unusable across some module boundaries/`isolatedModules`
 * setups — note it's ALSO unsupported by Node's native TS runner, same as
 * regular enum), or when a team specifically wants the nominal-typing-like
 * behavior and bidirectional reverse mapping for genuinely numeric,
 * bit-flag-style values.
 */

// --- The enum version --------------------------------------------------------
enum OrderStatusEnum {
  Pending,
  Shipped,
  Delivered,
  Cancelled,
}

function describeEnumStatus(status: OrderStatusEnum): string {
  switch (status) {
    case OrderStatusEnum.Pending:
      return "waiting to ship";
    case OrderStatusEnum.Shipped:
      return "on the way";
    case OrderStatusEnum.Delivered:
      return "delivered";
    case OrderStatusEnum.Cancelled:
      return "cancelled";
  }
}
console.log("enum Pending ->", describeEnumStatus(OrderStatusEnum.Pending));

// The type-safety hole mentioned above: this compiles with ZERO error,
// even though `999` is not any declared member of OrderStatusEnum.
const sketchyStatus: OrderStatusEnum = 999 as OrderStatusEnum;
console.log("enum accepts out-of-range value without complaint:", sketchyStatus);

// What an enum actually compiles to (roughly, for a numeric enum) — this is
// why it costs real bytes at runtime, unlike a type-only union:
//   var OrderStatusEnum;
//   (function (OrderStatusEnum) {
//       OrderStatusEnum[OrderStatusEnum["Pending"] = 0] = "Pending";
//       OrderStatusEnum[OrderStatusEnum["Shipped"] = 1] = "Shipped";
//       ...
//   })(OrderStatusEnum || (OrderStatusEnum = {}));
// That reverse mapping (`OrderStatusEnum[0] === "Pending"`) is sometimes
// useful, but most codebases never use it and pay for it anyway.
console.log("enum reverse mapping exists:", OrderStatusEnum[0]);

// --- The literal-union version ----------------------------------------------
// This is the recommended modern style. `as const` on the array below is
// what makes `typeof ORDER_STATUSES[number]` a union of the LITERAL string
// values rather than the widened type `string` — a common gotcha: without
// `as const`, TypeScript would infer `string[]`, and the derived union
// would just be `string`, defeating the whole point.
const ORDER_STATUSES = ["pending", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];
// OrderStatus is exactly: "pending" | "shipped" | "delivered" | "cancelled"

function describeStatus(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "waiting to ship";
    case "shipped":
      return "on the way";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
  }
}
console.log("literal 'pending' ->", describeStatus("pending"));

// No equivalent hole: this is a genuine compile error (left as a comment
// since this file must still compile):
// const badStatus: OrderStatus = "not-a-real-status"; // Error!

// And it interoperates with plain data for free — no cast, no lookup
// table, because an OrderStatus literal IS just a string at runtime:
function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}
const fromApi: string = "shipped"; // imagine this came from `JSON.parse(responseBody)`
if (isOrderStatus(fromApi)) {
  console.log("validated API value as OrderStatus:", describeStatus(fromApi));
}

// Erasure proof: nothing from `ORDER_STATUSES`/`OrderStatus` needs to exist
// at runtime for the TYPE to work — only the array (used for the runtime
// validation above) actually costs bytes, and that's a deliberate choice,
// not a side effect of the type declaration itself.

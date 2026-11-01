'use strict';

/**
 * PROTOTYPAL INHERITANCE
 * =======================
 *
 * JavaScript objects don't inherit from "classes" the way Java/C++ do.
 * Every object has an internal link to another object called its
 * PROTOTYPE (accessible via Object.getPrototypeOf(obj), and historically
 * via the non-standard but universally supported `__proto__`). When you
 * read `obj.prop` and `prop` isn't found directly on `obj`, the engine
 * walks UP this prototype chain until it finds the property or hits
 * `null`. This is the PROTOTYPE CHAIN.
 *
 * Why this matters in interviews:
 *   - "What does `class` actually compile to?" is a standard senior
 *     question, and the answer is: prototypal inheritance with nicer
 *     syntax. Understanding the chain underneath demystifies `class`,
 *     explains why methods are shared (not copied per-instance), and
 *     explains surprising lookups (e.g. shadowing, `hasOwnProperty`).
 *   - It explains performance folklore ("put methods on the prototype,
 *     not in the constructor") - each instance would otherwise carry
 *     its own copy of every method.
 *   - `Object.create(null)` and `Object.create(proto)` come up when
 *     discussing how to build objects with no inherited junk (e.g. no
 *     inherited `toString`), useful for things like safe dictionaries.
 */

// --- Building the prototype chain manually with Object.create --------------
const animalProto = {
  describe() {
    return `${this.name} makes a sound.`;
  },
  speak() {
    return '...';
  },
};

const dogProto = Object.create(animalProto); // dogProto's prototype is animalProto
dogProto.speak = function () {
  return 'Woof!';
};

const rex = Object.create(dogProto); // rex's prototype is dogProto
rex.name = 'Rex';

console.log('--- Manual prototype chain via Object.create ---');
console.log(rex.describe()); // "Rex makes a sound." - found on animalProto
console.log(rex.speak());    // "Woof!" - found on dogProto, shadows animalProto's speak

// Walking the chain explicitly:
console.log('rex -> own properties:', Object.keys(rex));           // ['name']
console.log('rex.__proto__ === dogProto:', Object.getPrototypeOf(rex) === dogProto); // true
console.log(
  'dogProto.__proto__ === animalProto:',
  Object.getPrototypeOf(dogProto) === animalProto
); // true
console.log(
  'animalProto.__proto__ === Object.prototype:',
  Object.getPrototypeOf(animalProto) === Object.prototype
); // true - every normal object eventually chains to Object.prototype
console.log('Object.prototype.__proto__ === null:', Object.getPrototypeOf(Object.prototype) === null); // true, chain ends

// --- hasOwnProperty vs `in` (own property vs anywhere on the chain) --------
console.log('\n--- own vs inherited ---');
console.log("'name' in rex:", 'name' in rex);                        // true (own)
console.log("'speak' in rex:", 'speak' in rex);                       // true (inherited)
console.log('rex.hasOwnProperty("speak"):', Object.hasOwn(rex, 'speak')); // false - not own, it's inherited
console.log('rex.hasOwnProperty("name"):', Object.hasOwn(rex, 'name'));   // true

// --- `class` is sugar over exactly this mechanism ---------------------------
//
// Below, the same Animal/Dog relationship, written with `class`. Under the
// hood: methods defined in a class body are installed on `ClassName.prototype`
// (NOT on each instance), and `extends` sets up the prototype chain between
// the child's prototype and the parent's prototype - precisely the
// Object.create() relationship demonstrated above.
class Animal {
  constructor(name) {
    this.name = name; // own property, set per-instance
  }
  describe() {
    return `${this.name} makes a sound.`;
  }
  speak() {
    return '...';
  }
}

class Dog extends Animal {
  speak() {
    return 'Woof!';
  }
}

const rex2 = new Dog('Rex');

console.log('\n--- Same thing via class syntax ---');
console.log(rex2.describe()); // "Rex makes a sound." - inherited from Animal.prototype
console.log(rex2.speak());    // "Woof!" - Dog.prototype.speak shadows Animal.prototype.speak

// Proving it's the SAME mechanism:
console.log('typeof Dog:', typeof Dog); // "function" - classes ARE functions
console.log(
  'Dog.prototype.__proto__ === Animal.prototype:',
  Object.getPrototypeOf(Dog.prototype) === Animal.prototype
); // true - extends just wires up the prototype chain
console.log(
  'rex2.__proto__ === Dog.prototype:',
  Object.getPrototypeOf(rex2) === Dog.prototype
); // true
// Methods live on the prototype, not copied onto each instance:
console.log(
  'speak is shared, not per-instance:',
  new Dog('Fido').speak === rex2.speak
); // true - both instances reference the exact same function object

// --- Object.create(null): an object with NO prototype at all --------------
//
// Useful when you want a "pure dictionary" with zero inherited baggage -
// no toString, no hasOwnProperty, no constructor. Trade-off: you lose
// those inherited helpers too, so you must use Object.hasOwn(obj, key)
// instead of obj.hasOwnProperty(key).
const bareDict = Object.create(null);
bareDict.key = 'value';
console.log('\n--- Object.create(null) ---');
console.log('bareDict.key:', bareDict.key);                 // "value"
console.log('bareDict.toString:', bareDict.toString);        // undefined - no inherited Object.prototype
console.log('Object.hasOwn(bareDict, "key"):', Object.hasOwn(bareDict, 'key')); // true, still works

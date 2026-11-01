"""
Shallow copy vs deep copy.

WHY this matters: `copy.copy()` (shallow) creates a NEW outer container, but
the elements/attributes *inside* it are the SAME objects as in the original
-- not copies of them. For a flat structure of immutables (ints, strings)
this is indistinguishable from a deep copy. The bug appears the moment the
container holds a MUTABLE nested object (a list-of-lists, a dict whose
values are lists, a custom object holding a list attribute, etc): mutating
that nested object through the "copy" also mutates it through the
original, because there's only ever been one of it.

`copy.deepcopy()` recursively copies every nested mutable object too, so
the copy is fully independent all the way down.

Plain assignment (`b = a`) isn't a copy at all -- `b` and `a` are two names
for the exact same object. That's the baseline this file contrasts against.
"""

import copy


def demonstrate_assignment_is_not_a_copy():
    print("--- plain assignment: no copy happens at all ---")
    original = [1, 2, 3]
    alias = original
    alias.append(4)
    print(f"original = {original}")
    print(f"alias    = {alias}")
    print(f"original is alias -> {original is alias} (same object, two names)\n")


def demonstrate_shallow_copy_bug():
    print("--- copy.copy(): the shared-nested-reference bug, for real ---")
    original = [[1, 2], [3, 4]]
    shallow = copy.copy(original)

    print(f"original = {original}")
    print(f"shallow  = {shallow}")
    print(f"original is shallow         -> {original is shallow} "
          "(different outer list objects, as expected)")
    print(f"original[0] is shallow[0]   -> {original[0] is shallow[0]} "
          "(SAME inner list object -- this is the bug)")

    print("\nNow mutate the inner list only through `shallow`:")
    shallow[0].append(999)
    print(f"original = {original}  <- changed too, even though we only touched `shallow`!")
    print(f"shallow  = {shallow}")
    print(
        "The outer containers are independent (appending a whole new sublist "
        "to `shallow` would not affect `original`), but every object ALREADY "
        "inside at copy time is shared by reference, one level deep."
    )

    print("\nProof the outer level IS independent:")
    shallow.append([5, 6])
    print(f"shallow.append([5, 6]) -> shallow={shallow}")
    print(f"original unaffected    -> original={original}\n")


def demonstrate_deep_copy_fix():
    print("--- copy.deepcopy(): the fix, fully independent all the way down ---")
    original = [[1, 2], [3, 4]]
    deep = copy.deepcopy(original)

    print(f"original = {original}")
    print(f"deep     = {deep}")
    print(f"original[0] is deep[0] -> {original[0] is deep[0]} "
          "(different objects -- deepcopy recursed into the nested list)")

    print("\nMutating the inner list only through `deep`:")
    deep[0].append(999)
    print(f"original = {original}  <- unaffected, exactly as expected")
    print(f"deep     = {deep}\n")


class Team:
    """A realistic example beyond bare lists: an object whose attribute is
    itself mutable (a list of member names)."""

    def __init__(self, name, members):
        self.name = name
        self.members = members

    def __repr__(self):
        return f"Team(name={self.name!r}, members={self.members!r})"


def demonstrate_shallow_copy_bug_with_custom_object():
    print("--- the same bug with a real object, not just nested lists ---")
    engineering = Team("engineering", ["Alice", "Bob"])
    cloned_shallow = copy.copy(engineering)

    print(f"engineering    = {engineering}")
    print(f"cloned_shallow = {cloned_shallow}")
    print(f"engineering.members is cloned_shallow.members -> "
          f"{engineering.members is cloned_shallow.members} (shared list!)")

    cloned_shallow.members.append("Charlie")
    print("\ncloned_shallow.members.append('Charlie') leaks into the original:")
    print(f"engineering    = {engineering}  <- unexpectedly gained Charlie too")
    print(f"cloned_shallow = {cloned_shallow}")

    print("\nFixed with deepcopy:")
    engineering2 = Team("engineering", ["Alice", "Bob"])
    cloned_deep = copy.deepcopy(engineering2)
    cloned_deep.members.append("Charlie")
    print(f"engineering2 = {engineering2}  <- unaffected")
    print(f"cloned_deep  = {cloned_deep}")


if __name__ == "__main__":
    demonstrate_assignment_is_not_a_copy()
    demonstrate_shallow_copy_bug()
    demonstrate_deep_copy_fix()
    demonstrate_shallow_copy_bug_with_custom_object()

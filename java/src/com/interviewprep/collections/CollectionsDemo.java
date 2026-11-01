package com.interviewprep.collections;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * COLLECTIONS FRAMEWORK -- when to use List vs Set vs Map, and ArrayList vs
 * LinkedList, with real Big-O tradeoffs.
 *
 * LIST vs SET vs MAP:
 *   - List: ordered, allows duplicates, access by index. Use when order/position
 *     matters or duplicates are meaningful (e.g. a sequence of log events).
 *   - Set: no duplicates, membership-focused ("have I seen this before?").
 *     HashSet gives O(1) avg add/contains (no order guarantee); LinkedHashSet
 *     keeps insertion order; TreeSet keeps sorted order at O(log n) per op.
 *   - Map: key -> value association, for lookups by key rather than position.
 *     HashMap: O(1) avg get/put; TreeMap: O(log n) but sorted by key;
 *     LinkedHashMap: O(1) avg and preserves insertion order.
 *
 * ArrayList vs LinkedList (both implement List):
 *   - ArrayList: backed by a resizable array.
 *       get(index):        O(1)  -- direct array index
 *       add at end:        O(1)  amortized (occasional O(n) resize/copy)
 *       add/remove at front or middle: O(n) -- must shift every following element
 *     Cache-friendly (contiguous memory) -- in practice almost always faster than
 *     LinkedList even for insert-heavy workloads, due to CPU cache locality.
 *   - LinkedList: backed by a doubly-linked list.
 *       get(index):        O(n) -- must walk node-by-node from an end
 *       add/remove at front or back: O(1) -- just relink pointers
 *       add/remove in the middle: O(n) to find the node, O(1) to relink once found
 *     Also implements Deque, so it's a reasonable choice for a queue/stack where
 *     you only ever push/pop at the ends -- but ArrayDeque is usually preferred
 *     in practice for that (better cache locality, no per-node object overhead).
 *
 * Bottom line real interviewers want to hear: "ArrayList by default; LinkedList
 * only if you specifically need O(1) insert/remove at both ends of a sequence
 * and even then ArrayDeque is usually the better choice."
 */
public class CollectionsDemo {
    public static void main(String[] args) {
        // --- List: ordered, duplicates allowed ---
        List<String> visitLog = new ArrayList<>();
        visitLog.add("home");
        visitLog.add("products");
        visitLog.add("home"); // duplicate visit -- meaningful, kept
        System.out.println("Visit log (List, order + duplicates matter): " + visitLog);

        // --- Set: dedupe, membership checks ---
        Set<String> uniqueVisitors = new HashSet<>();
        uniqueVisitors.add("alice");
        uniqueVisitors.add("bob");
        uniqueVisitors.add("alice"); // ignored -- already present
        System.out.println("Unique visitors (Set, de-duplicated): " + uniqueVisitors
                + "  size=" + uniqueVisitors.size());

        // --- Map: key -> value lookups ---
        Map<String, Integer> visitorPageViews = new HashMap<>();
        visitorPageViews.put("alice", 5);
        visitorPageViews.put("bob", 2);
        visitorPageViews.merge("alice", 1, Integer::sum); // alice views another page
        System.out.println("Page views by visitor (Map): " + visitorPageViews);

        // --- ArrayList vs LinkedList: demonstrate the real tradeoff ---
        int n = 50_000;

        List<Integer> arrayList = new ArrayList<>();
        long startArrayAppend = System.nanoTime();
        for (int i = 0; i < n; i++) arrayList.add(i);
        long arrayAppendNanos = System.nanoTime() - startArrayAppend;

        List<Integer> linkedList = new LinkedList<>();
        long startLinkedAppend = System.nanoTime();
        for (int i = 0; i < n; i++) linkedList.add(i);
        long linkedAppendNanos = System.nanoTime() - startLinkedAppend;

        System.out.printf("Append %,d elements at the end: ArrayList=%.2fms, LinkedList=%.2fms%n",
                n, arrayAppendNanos / 1e6, linkedAppendNanos / 1e6);

        long startArrayGet = System.nanoTime();
        int dummy1 = arrayList.get(n / 2); // O(1) for ArrayList
        long arrayGetNanos = System.nanoTime() - startArrayGet;

        long startLinkedGet = System.nanoTime();
        int dummy2 = linkedList.get(n / 2); // O(n) for LinkedList -- must walk the list
        long linkedGetNanos = System.nanoTime() - startLinkedGet;

        System.out.printf("get(middle index) once: ArrayList=%,dns (O(1)), LinkedList=%,dns (O(n))%n",
                arrayGetNanos, linkedGetNanos);
        System.out.println("(get(middle) values fetched, unused otherwise: " + dummy1 + ", " + dummy2 + ")");

        long startArrayFront = System.nanoTime();
        arrayList.add(0, -1); // O(n) for ArrayList -- shifts everything right
        long arrayFrontNanos = System.nanoTime() - startArrayFront;

        long startLinkedFront = System.nanoTime();
        linkedList.add(0, -1); // O(1) for LinkedList -- just relinks the head
        long linkedFrontNanos = System.nanoTime() - startLinkedFront;

        System.out.printf("add(0, x) at the front once: ArrayList=%,dns (O(n)), LinkedList=%,dns (O(1))%n",
                arrayFrontNanos, linkedFrontNanos);
    }
}

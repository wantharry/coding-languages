package com.interviewprep.streams;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * STREAMS API: a real filter/map/reduce/collect pipeline, compared to the
 * equivalent imperative loop.
 *
 * Streams don't do anything a loop can't -- the value is declarative clarity
 * (each stage says WHAT to do, not HOW to iterate/accumulate) and composability.
 * The tradeoff: debugging a long chained pipeline can be harder than stepping
 * through a loop, and naive stream use can be slower than a hand-tuned loop for
 * very hot paths, so this isn't a free lunch -- it's a readability/maintainability
 * trade a senior engineer should be able to articulate, not a universal win.
 */
public class StreamsDemo {
    public static void main(String[] args) {
        List<Employee> employees = List.of(
                new Employee("Alice", "Engineering", 95000),
                new Employee("Bob", "Engineering", 88000),
                new Employee("Carol", "Sales", 72000),
                new Employee("Dave", "Sales", 65000),
                new Employee("Eve", "Engineering", 110000)
        );

        // --- STREAMS version: filter -> map -> reduce/collect ---
        double totalEngineeringSalary = employees.stream()
                .filter(e -> e.getDepartment().equals("Engineering"))
                .map(Employee::getSalary)
                .reduce(0.0, Double::sum);
        System.out.println("[Streams] Total Engineering salary: " + totalEngineeringSalary);

        List<String> highEarnerNames = employees.stream()
                .filter(e -> e.getSalary() > 80000)
                .sorted((a, b) -> Double.compare(b.getSalary(), a.getSalary()))
                .map(Employee::getName)
                .collect(Collectors.toList());
        System.out.println("[Streams] High earners (>80k), highest first: " + highEarnerNames);

        Map<String, Double> avgSalaryByDept = employees.stream()
                .collect(Collectors.groupingBy(Employee::getDepartment,
                        Collectors.averagingDouble(Employee::getSalary)));
        System.out.println("[Streams] Average salary by department: " + avgSalaryByDept);

        // --- IMPERATIVE version of the same first computation, for comparison ---
        double totalImperative = 0.0;
        for (Employee e : employees) {
            if (e.getDepartment().equals("Engineering")) {
                totalImperative += e.getSalary();
            }
        }
        System.out.println("[Imperative loop] Total Engineering salary: " + totalImperative
                + "  (same result, more lines, mutable accumulator variable, "
                + "and the loop's INTENT -- 'sum the salaries of a filtered subset' "
                + "-- is implicit rather than named by the pipeline stages)");
    }
}

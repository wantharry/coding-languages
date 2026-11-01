package com.interviewprep.springbootdemo.repository;

import com.interviewprep.springbootdemo.entity.Priority;
import com.interviewprep.springbootdemo.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository layer: the only layer that is allowed to know about persistence at all.
 *
 * ------------------------------------------------------------------------------------
 * RESPONSIBILITY OF THIS LAYER
 * ------------------------------------------------------------------------------------
 * Talk to the database and nothing else. No business rules, no HTTP concerns - just
 * CRUD and queries, expressed as Java method calls instead of hand-written SQL.
 *
 * ------------------------------------------------------------------------------------
 * HOW THIS INTERFACE BECOMES A WORKING OBJECT WITH NO IMPLEMENTATION CODE
 * ------------------------------------------------------------------------------------
 * We never write a class implementing this interface. Spring Data JPA generates a
 * proxy implementation at startup ({@code SimpleJpaRepository} under the hood, wrapped
 * by a dynamic proxy) and registers it as a bean, purely because this interface
 * extends {@code JpaRepository<Task, Long>}. That base interface alone already gives
 * us {@code save()}, {@code findById()}, {@code findAll()}, {@code deleteById()},
 * pagination, and sorting for free.
 *
 * ------------------------------------------------------------------------------------
 * DERIVED QUERY METHODS - THE "MAGIC" PART
 * ------------------------------------------------------------------------------------
 * The methods below have no body and no {@code @Query} annotation. Spring Data parses
 * the *method name itself* at startup, splits it into clauses
 * ("findBy" + "Completed", "findBy" + "TitleContainingIgnoreCase"), matches those
 * clauses against {@link Task}'s field names, and builds the equivalent JPQL/SQL for
 * us automatically. This is a real senior-interview topic: know that it's driven by
 * naming convention + reflection on the entity's metamodel, not actual magic, and know
 * when to stop relying on it (complex joins, dynamic filters, or reporting-style
 * queries are better served by {@code @Query} or the Criteria API / Querydsl).
 */
public interface TaskRepository extends JpaRepository<Task, Long> {

	// Derived query: "WHERE completed = ?1"
	List<Task> findByCompleted(boolean completed);

	// Derived query: "WHERE priority = ?1"
	List<Task> findByPriority(Priority priority);

	// Derived query: "WHERE LOWER(title) LIKE LOWER('%' || ?1 || '%')"
	// (case-insensitive partial match, decomposed from the method name's
	// "Title" + "Containing" + "IgnoreCase" keywords)
	List<Task> findByTitleContainingIgnoreCase(String title);
}

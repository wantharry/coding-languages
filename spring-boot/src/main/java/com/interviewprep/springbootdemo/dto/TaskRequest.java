package com.interviewprep.springbootdemo.dto;

import com.interviewprep.springbootdemo.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * The shape of data the *client* sends us - deliberately a separate type from
 * {@link com.interviewprep.springbootdemo.entity.Task}.
 *
 * ------------------------------------------------------------------------------------
 * WHY A SEPARATE REQUEST DTO INSTEAD OF BINDING DIRECTLY TO THE ENTITY
 * ------------------------------------------------------------------------------------
 * 1. Security: binding {@code @RequestBody} straight to an {@code @Entity} lets a
 *    caller set fields they should never control (e.g. {@code id}, {@code createdAt},
 *    or in a richer model, something like {@code isAdmin}) - the classic
 *    "mass assignment" vulnerability.
 * 2. Decoupling: the wire format and the persistence model are allowed to evolve
 *    independently. Renaming a database column shouldn't have to break API clients.
 * 3. Validation belongs on input, not on the domain model - a {@code Task} entity
 *    loaded from the database is already valid by definition; it's the *incoming*
 *    data that needs checking.
 *
 * WHY A RECORD: this is an immutable bag of data with no behavior - a textbook case
 * for a Java record. Jakarta Bean Validation annotations placed on record components
 * are propagated to the generated field/accessor automatically, so {@code @Valid}
 * on the controller parameter still works exactly as it would on a classic POJO.
 *
 * ------------------------------------------------------------------------------------
 * WHAT HAPPENS WHEN VALIDATION FAILS
 * ------------------------------------------------------------------------------------
 * When a controller method parameter is annotated {@code @Valid} and one of these
 * constraints is violated, Spring never even enters the controller method body -
 * it throws {@code MethodArgumentNotValidException} before the method is invoked.
 * We catch that in {@link com.interviewprep.springbootdemo.exception.GlobalExceptionHandler}
 * and turn it into a structured 400 response instead of a raw stack trace.
 */
public record TaskRequest(

		@NotBlank(message = "title must not be blank")
		@Size(max = 200, message = "title must be at most 200 characters")
		String title,

		@Size(max = 1000, message = "description must be at most 1000 characters")
		String description,

		@NotNull(message = "priority is required (LOW, MEDIUM, or HIGH)")
		Priority priority
) {
}

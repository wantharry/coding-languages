package com.interviewprep.springbootdemo.exception;

/**
 * A plain, unchecked domain exception. It deliberately knows nothing about HTTP -
 * that translation to a status code happens in {@link GlobalExceptionHandler}. This
 * keeps the service layer honest: it can be unit-tested and reused (e.g. by a future
 * CLI or messaging consumer) without dragging in {@code javax.servlet}/HTTP concepts.
 */
public class TaskNotFoundException extends RuntimeException {

	public TaskNotFoundException(Long id) {
		super("Task not found with id " + id);
	}
}

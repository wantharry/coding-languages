package com.interviewprep.springbootdemo.dto;

import com.interviewprep.springbootdemo.entity.Priority;
import com.interviewprep.springbootdemo.entity.Task;

import java.time.LocalDateTime;

/**
 * The shape of data we send *back* to the client - again, deliberately not the raw
 * entity. Returning entities directly from a controller is a common beginner mistake:
 * it couples your API contract to your database schema, and if the entity ever grows
 * a lazy-loaded relationship, serializing it directly can trigger
 * {@code LazyInitializationException} or accidentally leak data that was never meant
 * to be public.
 */
public record TaskResponse(
		Long id,
		String title,
		String description,
		boolean completed,
		Priority priority,
		LocalDateTime createdAt
) {

	public static TaskResponse fromEntity(Task task) {
		return new TaskResponse(
				task.getId(),
				task.getTitle(),
				task.getDescription(),
				task.isCompleted(),
				task.getPriority(),
				task.getCreatedAt()
		);
	}
}

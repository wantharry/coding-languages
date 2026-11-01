package com.interviewprep.springbootdemo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * JPA entity mapping this class to the {@code tasks} table.
 *
 * ------------------------------------------------------------------------------------
 * WHAT @Entity ACTUALLY DOES
 * ------------------------------------------------------------------------------------
 * {@code @Entity} tells Hibernate (the JPA provider Spring Boot auto-configures for
 * us) to manage instances of this class as persistent objects. Under the hood,
 * Hibernate generates a bytecode-enhanced proxy subclass for lazy-loading support and
 * tracks every managed instance in the current {@code EntityManager}'s "persistence
 * context" - this is how a plain {@code task.setTitle(...)} inside a
 * {@code @Transactional} method gets flushed to the database automatically at commit,
 * with no explicit {@code save()} call required (this is "dirty checking").
 *
 * WHY NO LOMBOK @Data HERE: {@code @Data} generates {@code equals()}/{@code hashCode()}
 * from all fields, which is actively dangerous on a JPA entity - hashing/comparing a
 * lazy-loaded collection field can trigger an unwanted DB query or a
 * {@code StackOverflowError} on bidirectional relationships, and an entity's identity
 * should really be based on its ID alone once persisted. So entities are a case where
 * hand-written (or no) equals/hashCode, a no-arg constructor, and plain getters/setters
 * are the safer senior-level choice over blanket Lombok annotations.
 *
 * WHY A NO-ARG CONSTRUCTOR IS REQUIRED: Hibernate instantiates entities via reflection
 * (or a proxy) before populating fields from the result set, so JPA mandates a
 * protected/public no-arg constructor on every entity.
 */
@Entity
@Table(name = "tasks")
public class Task {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 200)
	private String title;

	@Column(length = 1000)
	private String description;

	@Column(nullable = false)
	private boolean completed;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private Priority priority;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	// Required by JPA/Hibernate - see class-level comment.
	protected Task() {
	}

	public Task(String title, String description, Priority priority) {
		this.title = title;
		this.description = description;
		this.priority = priority;
		this.completed = false;
		this.createdAt = LocalDateTime.now();
	}

	public Long getId() {
		return id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public boolean isCompleted() {
		return completed;
	}

	public void setCompleted(boolean completed) {
		this.completed = completed;
	}

	public Priority getPriority() {
		return priority;
	}

	public void setPriority(Priority priority) {
		this.priority = priority;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	// Identity equality by ID only, and only once persisted - comparing two
	// transient (unsaved) entities by ID would make every transient instance
	// "equal," which is wrong. This is the standard, safe pattern for entities.
	@Override
	public boolean equals(Object o) {
		if (this == o) {
			return true;
		}
		if (!(o instanceof Task other)) {
			return false;
		}
		return id != null && id.equals(other.id);
	}

	@Override
	public int hashCode() {
		return Objects.hashCode(getClass());
	}
}

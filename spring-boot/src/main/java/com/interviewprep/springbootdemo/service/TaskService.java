package com.interviewprep.springbootdemo.service;

import com.interviewprep.springbootdemo.dto.TaskRequest;
import com.interviewprep.springbootdemo.entity.Priority;
import com.interviewprep.springbootdemo.entity.Task;
import com.interviewprep.springbootdemo.exception.TaskNotFoundException;
import com.interviewprep.springbootdemo.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service layer: where business logic (such as it is, for a demo CRUD resource)
 * lives, sitting between the HTTP-facing controller and the persistence-facing
 * repository.
 *
 * ------------------------------------------------------------------------------------
 * RESPONSIBILITY OF THIS LAYER
 * ------------------------------------------------------------------------------------
 * Orchestrate one or more repository calls into a single unit of work, enforce
 * business rules that don't belong in the entity or the controller, translate
 * "not found" into a domain exception, and define transaction boundaries. The
 * controller should never talk to the repository directly - that would collapse the
 * layering and make it impossible to, say, add caching or a second data source later
 * without touching every controller method.
 *
 * ------------------------------------------------------------------------------------
 * CONSTRUCTOR INJECTION, NOT @Autowired FIELD INJECTION
 * ------------------------------------------------------------------------------------
 * This class takes {@link TaskRepository} as a constructor parameter instead of
 * writing {@code @Autowired private TaskRepository taskRepository;}. As of a single
 * constructor existing, Spring doesn't even need an explicit {@code @Autowired} here
 * (implicit since Spring 4.3) - but the real reason to prefer this style is:
 *
 *   1. TESTABILITY: a unit test can call {@code new TaskService(mockRepository)}
 *      directly with a hand-rolled or Mockito mock, with zero Spring context needed.
 *      Field injection requires reflection hacks (or a full Spring test context) to
 *      substitute a mock, which is slower and heavier for what should be a plain
 *      unit test.
 *   2. IMMUTABILITY: the field can be {@code final}, so it's impossible to construct
 *      this object in a half-wired, broken state - the dependency is guaranteed
 *      present the moment the object exists.
 *   3. EXPLICITNESS: the constructor signature *is* the list of dependencies. A class
 *      that's accumulated eight field-injected dependencies hides that growing
 *      complexity; a constructor with eight parameters screams "this class is doing
 *      too much" and nudges you toward splitting it.
 *   4. NO CONTAINER REQUIRED: this class has no Spring-specific code or annotations
 *      on its fields at all - {@code @Service} is the only Spring dependency, and
 *      that's just so Spring's component scan can find and instantiate it. The class
 *      itself is plain Java.
 */
@Service
public class TaskService {

	private final TaskRepository taskRepository;

	public TaskService(TaskRepository taskRepository) {
		this.taskRepository = taskRepository;
	}

	@Transactional
	public Task createTask(TaskRequest request) {
		Task task = new Task(request.title(), request.description(), request.priority());
		return taskRepository.save(task);
	}

	@Transactional(readOnly = true)
	public List<Task> getAllTasks() {
		return taskRepository.findAll();
	}

	@Transactional(readOnly = true)
	public List<Task> getTasksByCompleted(boolean completed) {
		return taskRepository.findByCompleted(completed);
	}

	@Transactional(readOnly = true)
	public List<Task> getTasksByPriority(Priority priority) {
		return taskRepository.findByPriority(priority);
	}

	@Transactional(readOnly = true)
	public Task getTaskById(Long id) {
		return taskRepository.findById(id)
				.orElseThrow(() -> new TaskNotFoundException(id));
	}

	@Transactional
	public Task updateTask(Long id, TaskRequest request) {
		Task task = getTaskById(id);
		task.setTitle(request.title());
		task.setDescription(request.description());
		task.setPriority(request.priority());
		// No explicit taskRepository.save(task) call needed here: `task` is a
		// managed entity (loaded within this @Transactional method's persistence
		// context), so Hibernate's dirty checking flushes these field changes to
		// the database automatically when the transaction commits. Calling save()
		// anyway is harmless but not required - a good interview nuance to know.
		return task;
	}

	@Transactional
	public Task markCompleted(Long id, boolean completed) {
		Task task = getTaskById(id);
		task.setCompleted(completed);
		return task;
	}

	@Transactional
	public void deleteTask(Long id) {
		Optional<Task> task = taskRepository.findById(id);
		if (task.isEmpty()) {
			throw new TaskNotFoundException(id);
		}
		taskRepository.deleteById(id);
	}
}

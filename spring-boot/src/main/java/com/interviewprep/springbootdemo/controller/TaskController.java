package com.interviewprep.springbootdemo.controller;

import com.interviewprep.springbootdemo.dto.TaskRequest;
import com.interviewprep.springbootdemo.dto.TaskResponse;
import com.interviewprep.springbootdemo.entity.Priority;
import com.interviewprep.springbootdemo.entity.Task;
import com.interviewprep.springbootdemo.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

/**
 * Controller layer: the only layer that knows about HTTP.
 *
 * ------------------------------------------------------------------------------------
 * RESPONSIBILITY OF THIS LAYER
 * ------------------------------------------------------------------------------------
 * Translate HTTP in (verb, path, query params, request body, headers) into a plain
 * Java method call on the service layer, and translate the plain Java result back
 * into HTTP out (status code, body, headers). No business logic and no direct
 * database access should ever live here - if you find yourself writing an `if`
 * statement that encodes a business rule in a controller method, it belongs in the
 * service layer instead.
 *
 * {@code @RestController} = {@code @Controller} + {@code @ResponseBody}: every
 * method's return value is serialized straight to the HTTP response body (JSON, via
 * the auto-configured Jackson {@code HttpMessageConverter}) instead of being resolved
 * to a server-rendered view name, which is what plain {@code @Controller} does.
 *
 * Constructor injection again here, for the same testability/immutability reasons
 * explained in {@link TaskService} - this controller can be unit-tested (e.g. with
 * {@code MockMvc} + a mocked {@code TaskService}) without a database or a running
 * container.
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

	private final TaskService taskService;

	public TaskController(TaskService taskService) {
		this.taskService = taskService;
	}

	// POST /api/tasks - create.
	// @Valid triggers Bean Validation on the deserialized TaskRequest *before* this
	// method body runs; a violation short-circuits straight to
	// GlobalExceptionHandler#handleValidation and this code never executes.
	@PostMapping
	public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request) {
		Task created = taskService.createTask(request);
		TaskResponse body = TaskResponse.fromEntity(created);
		// 201 Created + a Location header pointing at the new resource is the
		// textbook-correct REST response for a successful POST, not a bare 200.
		return ResponseEntity.created(URI.create("/api/tasks/" + created.getId())).body(body);
	}

	// GET /api/tasks[?completed=true][&priority=HIGH] - list, with optional filters
	// that fan out to the repository's derived query methods.
	@GetMapping
	public List<TaskResponse> getAllTasks(
			@RequestParam(required = false) Boolean completed,
			@RequestParam(required = false) Priority priority) {
		List<Task> tasks;
		if (completed != null) {
			tasks = taskService.getTasksByCompleted(completed);
		} else if (priority != null) {
			tasks = taskService.getTasksByPriority(priority);
		} else {
			tasks = taskService.getAllTasks();
		}
		return tasks.stream().map(TaskResponse::fromEntity).toList();
	}

	// GET /api/tasks/{id} - read one. @PathVariable binds {id} from the URL template.
	@GetMapping("/{id}")
	public TaskResponse getTaskById(@PathVariable Long id) {
		return TaskResponse.fromEntity(taskService.getTaskById(id));
	}

	// PUT /api/tasks/{id} - full update (replace title/description/priority).
	@PutMapping("/{id}")
	public TaskResponse updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
		return TaskResponse.fromEntity(taskService.updateTask(id, request));
	}

	// PATCH /api/tasks/{id}/complete?completed=true - a small, partial update.
	// Demonstrates PATCH for a single-field change, as distinct from PUT's
	// full-resource replacement semantics - a common interview distinction.
	@PatchMapping("/{id}/complete")
	public TaskResponse markCompleted(@PathVariable Long id, @RequestParam boolean completed) {
		return TaskResponse.fromEntity(taskService.markCompleted(id, completed));
	}

	// DELETE /api/tasks/{id} - delete. 204 No Content is the correct status for a
	// successful delete with no body to return.
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
		taskService.deleteTask(id);
		return ResponseEntity.noContent().build();
	}
}

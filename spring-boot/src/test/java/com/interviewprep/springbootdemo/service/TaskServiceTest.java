package com.interviewprep.springbootdemo.service;

import com.interviewprep.springbootdemo.dto.TaskRequest;
import com.interviewprep.springbootdemo.entity.Priority;
import com.interviewprep.springbootdemo.entity.Task;
import com.interviewprep.springbootdemo.exception.TaskNotFoundException;
import com.interviewprep.springbootdemo.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * A pure unit test - no Spring context, no database, no {@code @SpringBootTest}.
 * This is exactly the payoff of constructor injection described in
 * {@link TaskService}: we build the class under test with {@code new TaskService(mock)}
 * directly, so this test runs in milliseconds instead of the seconds a full context
 * load would take. {@code @ExtendWith(MockitoExtension.class)} just wires up the
 * {@code @Mock} fields for us; it adds no Spring involvement at all.
 */
@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

	@Mock
	private TaskRepository taskRepository;

	@Test
	void createTaskSavesAndReturnsTheNewTask() {
		TaskService service = new TaskService(taskRepository);
		TaskRequest request = new TaskRequest("Write tests", "Cover the service layer", Priority.HIGH);
		Task saved = new Task(request.title(), request.description(), request.priority());
		when(taskRepository.save(org.mockito.ArgumentMatchers.any(Task.class))).thenReturn(saved);

		Task result = service.createTask(request);

		assertThat(result.getTitle()).isEqualTo("Write tests");
		assertThat(result.getPriority()).isEqualTo(Priority.HIGH);
		verify(taskRepository).save(org.mockito.ArgumentMatchers.any(Task.class));
	}

	@Test
	void getTaskByIdThrowsWhenMissing() {
		TaskService service = new TaskService(taskRepository);
		when(taskRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.getTaskById(99L))
				.isInstanceOf(TaskNotFoundException.class)
				.hasMessageContaining("99");
	}
}

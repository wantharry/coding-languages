package com.interviewprep.springbootdemo.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * A full-stack integration test: {@code @SpringBootTest} boots the *entire* real
 * application context (controller, service, repository, the real H2
 * {@code DataSource}, auto-configuration and all) in-process, and
 * {@code @AutoConfigureMockMvc} lets us drive it with HTTP-shaped requests without
 * an actual network socket or servlet container. This is deliberately the one slow
 * test in the suite - it exists to prove the layers are wired together correctly
 * end-to-end, which the fast {@code TaskServiceTest} unit test can't verify by
 * itself (a unit test proves the service logic is correct in isolation; this proves
 * Spring actually assembles everything the way we expect).
 */
@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void createAndFetchRoundTrip() throws Exception {
		mockMvc.perform(post("/api/tasks")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"title":"Integration test task","description":"from MockMvc","priority":"MEDIUM"}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.title").value("Integration test task"))
				.andExpect(jsonPath("$.id").exists());

		mockMvc.perform(get("/api/tasks"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].title").exists());
	}

	@Test
	void creatingWithBlankTitleReturns400WithFieldErrors() throws Exception {
		mockMvc.perform(post("/api/tasks")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"title":"","description":"missing title","priority":"LOW"}
								"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.fieldErrors.title").exists());
	}

	@Test
	void fetchingUnknownIdReturns404() throws Exception {
		mockMvc.perform(get("/api/tasks/999999"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.status").value(404));
	}

	@Test
	void deleteRemovesTheTask() throws Exception {
		String response = mockMvc.perform(post("/api/tasks")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"title":"To be deleted","priority":"LOW"}
								"""))
				.andExpect(status().isCreated())
				.andReturn().getResponse().getContentAsString();

		Long id = Long.valueOf(response.replaceAll(".*\"id\":(\\d+).*", "$1"));

		mockMvc.perform(delete("/api/tasks/" + id))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/tasks/" + id))
				.andExpect(status().isNotFound());
	}
}

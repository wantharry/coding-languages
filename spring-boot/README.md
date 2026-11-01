# Spring Boot Demo: Task CRUD API

A small, genuinely-working Spring Boot REST API, built as senior-backend-engineer
interview preparation. It's a real "Task" resource with a real H2-backed persistence
layer — not a "hello world" controller — structured so each file demonstrates one
specific mechanic that comes up in senior interviews, with a comment at the point of
use explaining *why* it's built that way, not just *what* it does.

Generated with Spring Initializr (`web`/`webmvc`, `data-jpa`, `h2`, `validation`
starters), Spring Boot **4.1.2**, Java 21 target, built with the included Maven
wrapper (`./mvnw`) — no system-wide Maven required.

> Note on the Spring Boot version: by the time this was built, Spring Initializr no
> longer offers any 3.x line at all (Spring Boot has moved on to 4.x), so this project
> uses the current latest stable release, 4.1.2, instead of 3.x. Also note Spring Boot
> 4 renamed some starter/module coordinates versus 3.x — e.g. the web starter is now
> `spring-boot-starter-webmvc` (not `-web`), and a few autoconfigure classes moved
> package (e.g. `AutoConfigureMockMvc` now lives under
> `org.springframework.boot.webmvc.test.autoconfigure`). If you're coming from
> Boot 3.x tutorials, that's the main thing that looks unfamiliar in `pom.xml`.

## Project structure and what each piece teaches

```
src/main/java/com/interviewprep/springbootdemo/
├── SpringBootDemoApplication.java   Entry point; comment explains what auto-configuration
│                                    actually does at startup (classpath scanning +
│                                    conditional @Configuration classes)
├── entity/
│   ├── Task.java                    @Entity — the persistent domain model. Comments
│   │                                 cover why it needs a no-arg constructor, why it
│   │                                 avoids Lombok's @Data (dangerous equals/hashCode
│   │                                 on JPA proxies), and ID-based equals/hashCode.
│   └── Priority.java                Enum persisted as EnumType.STRING (not ORDINAL) —
│                                     comment explains why ordinal storage is a landmine.
├── repository/
│   └── TaskRepository.java          extends JpaRepository<Task, Long>. Demonstrates
│                                     Spring Data's "derived query methods" — methods
│                                     with no body/implementation at all
│                                     (findByCompleted, findByPriority,
│                                     findByTitleContainingIgnoreCase) whose SQL is
│                                     generated purely from the method name.
├── dto/
│   ├── TaskRequest.java              The inbound shape, with @NotBlank/@Size/@NotNull
│   │                                 Bean Validation annotations. A Java record, not
│   │                                 the entity — comment explains the mass-assignment
│   │                                 risk of binding @RequestBody straight to @Entity.
│   └── TaskResponse.java            The outbound shape — again not the raw entity, to
│                                     avoid leaking persistence concerns / lazy fields.
├── service/
│   └── TaskService.java             Business logic + transaction boundaries
│                                     (@Transactional). Constructor injection of
│                                     TaskRepository — the comment is the core DI
│                                     writeup: testability, immutability (final field),
│                                     explicitness, no-Spring-required-to-construct.
├── controller/
│   └── TaskController.java          @RestController with full CRUD:
│                                     POST/GET/GET-by-id/PUT/PATCH/DELETE on
│                                     /api/tasks. Constructor-injects TaskService.
│                                     Comments on REST status-code choices (201+Location
│                                     on create, 204 on delete, PUT-vs-PATCH semantics).
└── exception/
    ├── TaskNotFoundException.java   Plain unchecked domain exception — intentionally
    │                                 HTTP-agnostic.
    ├── ErrorResponse.java            Structured error body (timestamp, status, error,
    │                                 message, path, fieldErrors) returned for every
    │                                 failure path instead of a raw stack trace.
    └── GlobalExceptionHandler.java  @RestControllerAdvice centralizing exception ->
                                      HTTP-response translation: 404 for not-found, 400
                                      with a field->message map for validation
                                      failures, 500 catch-all that never leaks internals.

src/main/resources/application.properties
    Externalized configuration, with comments on how Spring Boot binds this file into
    the Environment and how any key can be overridden by env var / -D / CLI arg without
    recompiling. Configures the H2 JDBC URL, H2 console, Hibernate ddl-auto strategy,
    SQL logging, and server.port — all real properties actually used by the app, not
    placeholders.

src/test/java/com/interviewprep/springbootdemo/
├── SpringBootDemoApplicationTests.java     Generated smoke test (context loads).
├── service/TaskServiceTest.java            Pure Mockito unit test of TaskService with
│                                            no Spring context at all — the direct
│                                            payoff of constructor injection described
│                                            above: `new TaskService(mockRepo)`.
└── controller/TaskControllerIntegrationTest.java
    @SpringBootTest + @AutoConfigureMockMvc full-stack test driving the real
    controller -> service -> repository -> H2 chain through MockMvc: create+fetch
    round-trip, validation-failure 400, not-found 404, and a full delete.
```

### Layering: Controller -> Service -> Repository

- **Controller**: only layer that knows about HTTP (verbs, paths, status codes,
  `@RequestBody`/`@PathVariable`/`@RequestParam`). No business logic, no direct
  database access.
- **Service**: owns business rules and transaction boundaries (`@Transactional`).
  Translates a missing row into a domain exception. Orchestrates repository calls.
- **Repository**: only layer that touches persistence. A Spring Data JPA interface —
  no hand-written implementation exists; Spring generates a proxy at startup.

Each layer depends on the one below it via **constructor injection** of a `final`
field, never a mutable `@Autowired`-annotated field. See the long comment in
`TaskService.java` for the full testability/immutability/explicitness rationale — it's
one of the most commonly probed senior-interview topics ("why constructor injection
over field injection?").

## Build & run

From this directory (`spring-boot-demo` artifact lives directly here, no nested
subfolder):

```bash
# Build + run the full test suite (unit test + full-stack MockMvc integration test)
./mvnw clean package

# Build only, skip tests
./mvnw clean package -DskipTests

# Run just the tests
./mvnw test

# Run the app (foreground, Ctrl-C to stop)
./mvnw spring-boot:run

# ...or run the already-built jar directly
java -jar target/spring-boot-demo-0.0.1-SNAPSHOT.jar
```

The app starts an embedded Tomcat on **http://localhost:8080** backed by an in-memory
H2 database (schema recreated fresh — and wiped — on every start/stop, via
`spring.jpa.hibernate.ddl-auto=create-drop`). The H2 web console is available at
`http://localhost:8080/h2-console` while the app is running (JDBC URL
`jdbc:h2:mem:taskdb`, user `sa`, empty password) if you want to poke at the raw tables.

## Exercising the live API

All of the following were actually run against a live instance of this app during
development (see the task's verification output for raw curl transcripts); they're
repeated here as the canonical "how to try it yourself" reference.

```bash
# CREATE
curl -i -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Write senior interview notes","description":"Cover DI, JPA, REST, exceptions","priority":"HIGH"}'
# -> 201 Created, Location: /api/tasks/1, JSON body with generated id + createdAt

# READ (all / one / filtered by derived query method)
curl http://localhost:8080/api/tasks
curl http://localhost:8080/api/tasks/1
curl "http://localhost:8080/api/tasks?priority=HIGH"
curl "http://localhost:8080/api/tasks?completed=false"

# UPDATE (full replace)
curl -i -X PUT http://localhost:8080/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated title","description":"Updated desc","priority":"MEDIUM"}'

# PARTIAL UPDATE (single field)
curl -i -X PATCH "http://localhost:8080/api/tasks/1/complete?completed=true"

# DELETE
curl -i -X DELETE http://localhost:8080/api/tasks/1
# -> 204 No Content

# VALIDATION FAILURE (blank title)
curl -i -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"","priority":"LOW"}'
# -> 400 Bad Request, JSON body with fieldErrors.title explaining what's wrong

# NOT FOUND
curl -i http://localhost:8080/api/tasks/99999
# -> 404 Not Found, structured JSON error body (timestamp/status/error/message/path)
```

## What this deliberately does NOT cover

To stay focused and genuinely runnable with zero external setup, this demo skips
Spring Security, pagination/sorting (`Pageable`), caching, async/reactive (WebFlux),
and messaging — all real senior topics, but each deserving its own focused example
rather than being bolted onto a CRUD demo.

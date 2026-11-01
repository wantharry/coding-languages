package com.interviewprep.springbootdemo.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * ------------------------------------------------------------------------------------
 * CENTRALIZED EXCEPTION HANDLING
 * ------------------------------------------------------------------------------------
 * {@code @RestControllerAdvice} (= {@code @ControllerAdvice} + {@code @ResponseBody})
 * registers this as a single, global interceptor for exceptions thrown by *any*
 * {@code @RestController} in the application. Each {@code @ExceptionHandler} method
 * below is matched by the most specific exception type thrown anywhere in the
 * controller -> service -> repository call chain, so individual controller methods
 * stay free of try/catch noise and focus purely on the happy path. This is the
 * standard, senior-expected replacement for scattering try/catch blocks (or worse,
 * letting a raw stack trace leak to the client) across every endpoint.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	// Thrown by the service layer when a lookup-by-id misses. Mapped to 404, the
	// semantically correct status for "the resource you asked for doesn't exist."
	@ExceptionHandler(TaskNotFoundException.class)
	public ResponseEntity<ErrorResponse> handleNotFound(TaskNotFoundException ex, HttpServletRequest request) {
		ErrorResponse body = new ErrorResponse(
				HttpStatus.NOT_FOUND.value(),
				HttpStatus.NOT_FOUND.getReasonPhrase(),
				ex.getMessage(),
				request.getRequestURI()
		);
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
	}

	// Thrown automatically by Spring *before* a controller method body runs, when an
	// @Valid-annotated @RequestBody fails one or more Bean Validation constraints.
	// We collect every individual field error into a map so the client learns exactly
	// which fields failed and why, in one response, instead of one error at a time.
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
		Map<String, String> fieldErrors = new HashMap<>();
		for (FieldError error : ex.getBindingResult().getFieldErrors()) {
			fieldErrors.put(error.getField(), error.getDefaultMessage());
		}
		ErrorResponse body = new ErrorResponse(
				HttpStatus.BAD_REQUEST.value(),
				HttpStatus.BAD_REQUEST.getReasonPhrase(),
				"Validation failed for one or more fields",
				request.getRequestURI(),
				fieldErrors
		);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
	}

	// Catch-all safety net: anything unanticipated becomes a generic 500 with no
	// internal detail leaked to the caller. The real exception still gets logged
	// server-side (a production system would use a proper logger here) - the client
	// just never sees the stack trace.
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
		ErrorResponse body = new ErrorResponse(
				HttpStatus.INTERNAL_SERVER_ERROR.value(),
				HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
				"An unexpected error occurred",
				request.getRequestURI()
		);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
	}
}

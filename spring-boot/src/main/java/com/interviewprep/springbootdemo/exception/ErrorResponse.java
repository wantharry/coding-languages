package com.interviewprep.springbootdemo.exception;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * A consistent, structured error body for every failure path in the API - the whole
 * point of centralized exception handling. Without this, an unhandled exception in
 * Spring MVC falls through to the default error page/handler and can leak a raw stack
 * trace (or at best Spring Boot's generic {@code /error} JSON with no useful detail)
 * back to the client, which is both a poor API experience and a minor information
 * leak (stack traces reveal internal class/package names).
 */
public record ErrorResponse(
		LocalDateTime timestamp,
		int status,
		String error,
		String message,
		String path,
		Map<String, String> fieldErrors
) {

	public ErrorResponse(int status, String error, String message, String path) {
		this(LocalDateTime.now(), status, error, message, path, null);
	}

	public ErrorResponse(int status, String error, String message, String path, Map<String, String> fieldErrors) {
		this(LocalDateTime.now(), status, error, message, path, fieldErrors);
	}
}

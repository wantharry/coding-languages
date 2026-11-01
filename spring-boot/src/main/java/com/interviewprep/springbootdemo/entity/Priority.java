package com.interviewprep.springbootdemo.entity;

/**
 * A plain enum, stored on {@link Task} as {@code @Enumerated(EnumType.STRING)}.
 *
 * WHY STRING AND NOT ORDINAL: {@code EnumType.ORDINAL} persists the enum's
 * position (0, 1, 2...) as an int. That's compact but a landmine - if someone
 * later reorders or inserts a value in this enum, every existing row in the
 * database now silently refers to the wrong priority. {@code EnumType.STRING}
 * persists the name itself ("LOW", "MEDIUM", "HIGH"), which is slightly more
 * storage but immune to reordering and human-readable in the raw table - the
 * correct default for almost every real system.
 */
public enum Priority {
	LOW,
	MEDIUM,
	HIGH
}

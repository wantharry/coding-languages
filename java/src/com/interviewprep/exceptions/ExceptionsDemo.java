package com.interviewprep.exceptions;

/**
 * CHECKED vs UNCHECKED exceptions, try-with-resources, and a custom exception.
 *
 * ----------------------------------------------------------------------------
 * WHY CHECKED EXCEPTIONS ARE CONTROVERSIAL (an honest take, not just textbook):
 *
 * The original intent (Java in the mid-90s) was good: force callers to
 * acknowledge recoverable error conditions at compile time, so they can't be
 * silently ignored. In practice, this often backfires:
 *   - It pushes developers to swallow exceptions with an empty catch block
 *     just to satisfy the compiler, which is WORSE than not having the check.
 *   - It doesn't compose with functional interfaces / lambdas / streams --
 *     you can't throw a checked exception from a Runnable or a Stream.map()
 *     lambda without wrapping it, which is exactly why modern Java idioms
 *     (and most new JDK APIs since Java 8) lean on unchecked exceptions.
 *   - It leaks implementation detail into method signatures and couples
 *     unrelated layers (a low-level IOException propagating through a
 *     business-logic interface that has nothing to do with I/O).
 *   - Most other mainstream languages (C#, Kotlin, Python, JavaScript) don't
 *     have checked exceptions at all, and that hasn't caused their ecosystems
 *     to be noticeably less reliable.
 * The pragmatic modern guideline: use checked exceptions sparingly, only for
 * conditions the immediate caller can genuinely recover from (e.g. "insufficient
 * funds, ask the user for another payment method"); use unchecked exceptions
 * for programmer errors and anything the caller can't meaningfully recover from
 * at that call site.
 * ----------------------------------------------------------------------------
 */
public class ExceptionsDemo {
    public static void main(String[] args) {
        BankAccount account = new BankAccount(100.0);

        // Unchecked exception: caller is NOT forced to catch it, but can.
        try {
            account.deposit(-10);
        } catch (IllegalArgumentException e) {
            System.out.println("Caught unchecked exception: " + e.getMessage());
        }

        // Checked exception: the compiler would refuse to compile this call
        // without either a try/catch or a `throws` declaration on main().
        try {
            account.withdraw(500.0);
        } catch (InsufficientFundsException e) {
            System.out.println("Caught checked exception: " + e.getMessage()
                    + " (shortfall=" + e.getShortfall() + ")");
        }

        System.out.println("Final balance: " + account.getBalance());

        System.out.println();
        System.out.println("--- try-with-resources ---");
        try (LoggingResource first = new LoggingResource("first");
             LoggingResource second = new LoggingResource("second")) {
            first.use();
            second.use();
            // No explicit close() calls needed -- both close automatically,
            // in reverse order (second, then first), even though nothing failed.
        }

        System.out.println();
        System.out.println("--- try-with-resources closes even when an exception is thrown ---");
        try {
            try (LoggingResource resource = new LoggingResource("risky")) {
                resource.use();
                throw new RuntimeException("Something went wrong while using the resource");
            }
        } catch (RuntimeException e) {
            System.out.println("Caught: " + e.getMessage()
                    + " (note 'Closing resource: risky' was already printed above, "
                    + "proving close() ran before the exception reached this catch)");
        }
    }
}

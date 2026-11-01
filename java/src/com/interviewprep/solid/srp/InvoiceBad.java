package com.interviewprep.solid.srp;

/**
 * SINGLE RESPONSIBILITY PRINCIPLE -- VIOLATION.
 *
 * This class has at least THREE separate reasons to change:
 *   1. The math for computing the invoice total changes (e.g. tax rules).
 *   2. The format of the printed receipt changes (e.g. switch to a PDF).
 *   3. Where/how the invoice is persisted changes (e.g. switch from stdout
 *      "saving" to a real database).
 *
 * "A class should have one reason to change" (SRP) -- here, a change to
 * formatting logic risks breaking/retesting the pricing logic and the
 * persistence logic too, because they're all tangled in one class. That's
 * the real cost: unrelated changes become coupled and testing in isolation
 * becomes hard (you can't unit test the tax math without also exercising
 * "printing" and "saving").
 */
public class InvoiceBad {
    private final double subtotal;
    private final double taxRate;

    public InvoiceBad(double subtotal, double taxRate) {
        this.subtotal = subtotal;
        this.taxRate = taxRate;
    }

    // Responsibility 1: business math
    public double calculateTotal() {
        return subtotal + (subtotal * taxRate);
    }

    // Responsibility 2: presentation/formatting
    public void printReceipt() {
        System.out.printf("Receipt: subtotal=$%.2f, tax rate=%.0f%%, total=$%.2f%n",
                subtotal, taxRate * 100, calculateTotal());
    }

    // Responsibility 3: persistence
    public void saveToDatabase() {
        System.out.println("(Simulating) INSERT INTO invoices VALUES (" + calculateTotal() + ")");
    }
}

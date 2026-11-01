package com.interviewprep.solid.srp;

/** GOOD: one reason to change -- how the total is computed. */
public class InvoiceCalculator {
    public double calculateTotal(double subtotal, double taxRate) {
        return subtotal + (subtotal * taxRate);
    }
}

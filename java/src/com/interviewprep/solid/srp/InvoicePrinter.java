package com.interviewprep.solid.srp;

/** GOOD: one reason to change -- how the receipt is presented. */
public class InvoicePrinter {
    public void printReceipt(double subtotal, double taxRate, double total) {
        System.out.printf("Receipt: subtotal=$%.2f, tax rate=%.0f%%, total=$%.2f%n",
                subtotal, taxRate * 100, total);
    }
}

package com.interviewprep.solid.srp;

/** GOOD: one reason to change -- where/how the invoice is persisted. */
public class InvoiceRepository {
    public void save(double total) {
        System.out.println("(Simulating) INSERT INTO invoices VALUES (" + total + ")");
    }
}

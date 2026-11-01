package com.interviewprep.exceptions;

public class BankAccount {
    private double balance;

    public BankAccount(double initialBalance) {
        this.balance = initialBalance;
    }

    public double getBalance() {
        return balance;
    }

    public void deposit(double amount) {
        if (amount < 0) {
            // UNCHECKED exception: IllegalArgumentException extends RuntimeException.
            // Programmer error (bad argument) -- not something every caller should be
            // forced to catch; it signals a bug, not an expected business condition.
            throw new IllegalArgumentException("Deposit amount cannot be negative: " + amount);
        }
        balance += amount;
    }

    // CHECKED exception: declared with `throws`, forcing callers to handle the
    // "not enough money" case explicitly -- it's an expected, recoverable
    // outcome of calling withdraw(), not a bug.
    public void withdraw(double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException(amount - balance);
        }
        balance -= amount;
    }
}

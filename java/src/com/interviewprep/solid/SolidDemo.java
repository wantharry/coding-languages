package com.interviewprep.solid;

import com.interviewprep.solid.ocp.AreaCalculatorBad;
import com.interviewprep.solid.ocp.AreaCalculatorGood;
import com.interviewprep.solid.ocp.OcpCircle;
import com.interviewprep.solid.ocp.OcpShape;
import com.interviewprep.solid.ocp.OcpSquare;
import com.interviewprep.solid.ocp.OcpTriangle;
import com.interviewprep.solid.srp.InvoiceBad;
import com.interviewprep.solid.srp.InvoiceCalculator;
import com.interviewprep.solid.srp.InvoicePrinter;
import com.interviewprep.solid.srp.InvoiceRepository;

public class SolidDemo {
    public static void main(String[] args) {
        System.out.println("--- SRP: BAD (one class, three responsibilities) ---");
        InvoiceBad bad = new InvoiceBad(100.0, 0.08);
        bad.printReceipt();
        bad.saveToDatabase();

        System.out.println();
        System.out.println("--- SRP: GOOD (responsibilities split into collaborating classes) ---");
        InvoiceCalculator calculator = new InvoiceCalculator();
        InvoicePrinter printer = new InvoicePrinter();
        InvoiceRepository repository = new InvoiceRepository();

        double subtotal = 100.0;
        double taxRate = 0.08;
        double total = calculator.calculateTotal(subtotal, taxRate);
        printer.printReceipt(subtotal, taxRate, total);
        repository.save(total);

        System.out.println();
        System.out.println("--- OCP: BAD (totalArea() must be edited for every new shape type) ---");
        AreaCalculatorBad badCalc = new AreaCalculatorBad();
        Object[] badShapes = {
                new AreaCalculatorBad.BadCircle(2.0),
                new AreaCalculatorBad.BadSquare(3.0)
        };
        System.out.println("Total area (bad): " + badCalc.totalArea(badShapes));

        System.out.println();
        System.out.println("--- OCP: GOOD (adding OcpTriangle required zero changes to AreaCalculatorGood) ---");
        AreaCalculatorGood goodCalc = new AreaCalculatorGood();
        OcpShape[] goodShapes = {
                new OcpCircle(2.0),
                new OcpSquare(3.0),
                new OcpTriangle(4.0, 5.0) // the "new" shape -- calculator code is untouched
        };
        System.out.println("Total area (good, now including a Triangle): " + goodCalc.totalArea(goodShapes));
    }
}

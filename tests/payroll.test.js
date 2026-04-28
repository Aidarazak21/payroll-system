const { calculatePayroll } = require('../src/utils/payrollCalculator');

describe('Payroll Calculation Logic', () => {
    test('should calculate correct values based on Assessment Example', () => {
        // Data from Assessment 2.txt example
        const basic = 4000;
        const allowance = 600;
        const hourlyRate = 25;
        const otHours = 10;

        const result = calculatePayroll(basic, allowance, hourlyRate, otHours);

        expect(result.overtimePay).toBe(250);
        expect(result.grossPay).toBe(4850);
        expect(result.tax).toBe(388);
        expect(result.epfEmployee).toBe(533.50);
        expect(result.epfEmployer).toBe(630.50);
        expect(result.netPay).toBe(3928.50);
    });

    test('should handle zero overtime hours', () => {
        const result = calculatePayroll(3000, 200, 20, 0);
        
        expect(result.overtimePay).toBe(0);
        expect(result.grossPay).toBe(3200);
        expect(result.netPay).toBe(2592); // 3200 - (256 tax + 352 epf)
    });

    test('should handle string inputs correctly', () => {
        const result = calculatePayroll("5000", "500", "40", "5");
        
        expect(result.grossPay).toBe(5700);
        expect(typeof result.netPay).toBe('number');
    });
});

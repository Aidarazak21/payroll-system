// CARA KIRA PAYROLL 

const calculatePayroll = (basicSalary, allowance, hourlyRate, otHours) => {
    const basic = parseFloat(basicSalary) || 0;
    const allow = parseFloat(allowance) || 0;
    const rate = parseFloat(hourlyRate) || 0;
    const ot = parseInt(otHours) || 0;

    const overtimePay = rate * ot;
    const grossPay = basic + allow + overtimePay;
    
    // Assessment Formulas
    const tax = grossPay * 0.08;
    const epfEmployee = grossPay * 0.11;
    const epfEmployer = grossPay * 0.13;
    const netPay = grossPay - tax - epfEmployee;

    return {
        basicSalary: basic,
        allowance: allow,
        overtimePay,
        grossPay,
        tax,
        epfEmployee,
        epfEmployer,
        netPay
    };
};

module.exports = { calculatePayroll };

const { sql, poolPromise } = require('../config/database');

class PayrollRecord {
    static async findAll(month = null, year = null, page = 1, limit = 10) {
        const pool = await poolPromise;
        const offset = (page - 1) * limit;

        let countQuery = `SELECT COUNT(*) as total FROM payroll_records p`;
        let dataQuery = `
            SELECT p.*, e.name as employee_name, e.position, d.name as department_name 
            FROM payroll_records p 
            JOIN employees e ON p.employee_id = e.id 
            JOIN departments d ON e.department_id = d.id
        `;
        
        const countRequest = pool.request();
        const dataRequest = pool.request();
        let conditions = [];
        
        if (month) {
            conditions.push(`p.month = @month`);
            countRequest.input('month', sql.Int, month);
            dataRequest.input('month', sql.Int, month);
        }
        if (year) {
            conditions.push(`p.year = @year`);
            countRequest.input('year', sql.Int, year);
            dataRequest.input('year', sql.Int, year);
        }
        
        if (conditions.length > 0) {
            const whereClause = ` WHERE ` + conditions.join(' AND ');
            countQuery += whereClause;
            dataQuery += whereClause;
        }
        
        dataQuery += ` ORDER BY p.year DESC, p.month DESC, e.name ASC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
        dataRequest.input('offset', sql.Int, offset);
        dataRequest.input('limit', sql.Int, limit);
        
        const totalResult = await countRequest.query(countQuery);
        const total = totalResult.recordset[0].total;
        
        const result = await dataRequest.query(dataQuery);
        
        return {
            data: result.recordset,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    static async findById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT p.*, e.name as employee_name, e.position, d.name as department_name 
                FROM payroll_records p 
                JOIN employees e ON p.employee_id = e.id 
                JOIN departments d ON e.department_id = d.id 
                WHERE p.id = @id
            `);
        return result.recordset[0];
    }

    static async checkExists(month, year) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('month', sql.Int, month)
            .input('year', sql.Int, year)
            .query('SELECT TOP 1 id FROM payroll_records WHERE month = @month AND year = @year');
        return result.recordset.length > 0;
    }

    static async generatePayroll(month, year) {
        const pool = await poolPromise;
        
        // Check if payroll has already been generated for this month/year for ANY employee
        const globalCheck = await pool.request()
            .input('m', sql.Int, month)
            .input('y', sql.Int, year)
            .query('SELECT TOP 1 id FROM payroll_records WHERE month = @m AND year = @y');
        
        if (globalCheck.recordset.length > 0) {
            throw new Error('DUPLICATE_PAYROLL');
        }

        const transaction = new sql.Transaction(pool);
        
        try {
            await transaction.begin();
            const request = new sql.Request(transaction);
            
            // Get all employees
            const employeesResult = await request.query('SELECT * FROM employees');
            const employees = employeesResult.recordset;
            
            if (employees.length === 0) {
                throw new Error('NO_EMPLOYEES');
            }

            const { calculatePayroll } = require('../utils/payrollCalculator');
            let processedCount = 0;
            for (const emp of employees) {
                const calculations = calculatePayroll(
                    emp.basic_salary, 
                    emp.allowance, 
                    emp.hourly_rate, 
                    emp.overtime_hours
                );
                
                const insertReq = new sql.Request(transaction);
                await insertReq
                    .input('employee_id', sql.Int, emp.id)
                    .input('month', sql.Int, month)
                    .input('year', sql.Int, year)
                    .input('basic_salary', sql.Decimal(10,2), calculations.basicSalary)
                    .input('allowance', sql.Decimal(10,2), calculations.allowance)
                    .input('overtime_pay', sql.Decimal(10,2), calculations.overtimePay)
                    .input('epf_employee', sql.Decimal(10,2), calculations.epfEmployee)
                    .input('epf_employer', sql.Decimal(10,2), calculations.epfEmployer)
                    .input('tax', sql.Decimal(10,2), calculations.tax)
                    .input('gross_pay', sql.Decimal(10,2), calculations.grossPay)
                    .input('net_pay', sql.Decimal(10,2), calculations.netPay)
                    .query(`
                        INSERT INTO payroll_records 
                        (employee_id, month, year, basic_salary, allowance, overtime_pay, epf_employee, epf_employer, tax, gross_pay, net_pay) 
                        VALUES 
                        (@employee_id, @month, @year, @basic_salary, @allowance, @overtime_pay, @epf_employee, @epf_employer, @tax, @gross_pay, @net_pay)
                    `);
                processedCount++;
            }
            
            await transaction.commit();
            return { success: true, count: processedCount };
        } catch (error) {
            if (transaction.isOpen) await transaction.rollback();
            throw error;
        }
    }
}

module.exports = PayrollRecord;

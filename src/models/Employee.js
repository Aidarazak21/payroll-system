const { sql, poolPromise } = require('../config/database');

class Employee {
    static async findAll(departmentId = null, page = 1, limit = 10) {
        const pool = await poolPromise;
        const offset = (page - 1) * limit;
        
        let countQuery = `SELECT COUNT(*) as total FROM employees e`;
        let dataQuery = `
            SELECT e.*, d.name as department_name 
            FROM employees e 
            JOIN departments d ON e.department_id = d.id
        `;
        
        const countRequest = pool.request();
        const dataRequest = pool.request();
        
        if (departmentId) {
            countQuery += ` WHERE e.department_id = @dept_id`;
            dataQuery += ` WHERE e.department_id = @dept_id`;
            countRequest.input('dept_id', sql.Int, departmentId);
            dataRequest.input('dept_id', sql.Int, departmentId);
        }
        
        dataQuery += ` ORDER BY e.name ASC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
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
                SELECT e.*, d.name as department_name 
                FROM employees e 
                JOIN departments d ON e.department_id = d.id 
                WHERE e.id = @id
            `);
        return result.recordset[0];
    }

    static async create(data) {
        const pool = await poolPromise;
        await pool.request()
            .input('department_id', sql.Int, data.department_id)
            .input('name', sql.NVarChar, data.name)
            .input('position', sql.NVarChar, data.position)
            .input('basic_salary', sql.Decimal(10,2), data.basic_salary)
            .input('allowance', sql.Decimal(10,2), data.allowance || 0)
            .input('hourly_rate', sql.Decimal(10,2), data.hourly_rate || 0)
            .input('overtime_hours', sql.Int, data.overtime_hours || 0)
            .query(`
                INSERT INTO employees (department_id, name, position, basic_salary, allowance, hourly_rate, overtime_hours) 
                VALUES (@department_id, @name, @position, @basic_salary, @allowance, @hourly_rate, @overtime_hours)
            `);
    }

    static async update(id, data) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('department_id', sql.Int, data.department_id)
            .input('name', sql.NVarChar, data.name)
            .input('position', sql.NVarChar, data.position)
            .input('basic_salary', sql.Decimal(10,2), data.basic_salary)
            .input('allowance', sql.Decimal(10,2), data.allowance || 0)
            .input('hourly_rate', sql.Decimal(10,2), data.hourly_rate || 0)
            .input('overtime_hours', sql.Int, data.overtime_hours || 0)
            .query(`
                UPDATE employees 
                SET department_id = @department_id, name = @name, position = @position, 
                    basic_salary = @basic_salary, allowance = @allowance, 
                    hourly_rate = @hourly_rate, overtime_hours = @overtime_hours 
                WHERE id = @id
            `);
    }

    static async delete(id) {
        const pool = await poolPromise;
        
        // Check if employee has payroll records
        const payrollCheck = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT TOP 1 id FROM payroll_records WHERE employee_id = @id');
        
        if (payrollCheck.recordset.length > 0) {
            throw new Error('HAS_PAYROLL_RECORDS');
        }

        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM employees WHERE id = @id');
    }
}

module.exports = Employee;

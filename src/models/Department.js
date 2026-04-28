const { sql, poolPromise } = require('../config/database');

class Department {
    static async findAll() {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM departments ORDER BY name ASC');
        return result.recordset;
    }

    static async findById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM departments WHERE id = @id');
        return result.recordset[0];
    }

    static async create(data) {
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.NVarChar, data.name)
            .query('INSERT INTO departments (name) VALUES (@name)');
    }

    static async update(id, data) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, data.name)
            .query('UPDATE departments SET name = @name WHERE id = @id');
    }

    static async delete(id) {
        const pool = await poolPromise;
        
        // Check if department has employees
        const employeeCheck = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT TOP 1 id FROM employees WHERE department_id = @id');
        
        if (employeeCheck.recordset.length > 0) {
            throw new Error('HAS_EMPLOYEES');
        }

        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM departments WHERE id = @id');
    }
}

module.exports = Department;

const { sql, poolPromise } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    static async findByEmail(email) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('email', sql.NVarChar, email)
                .query('SELECT * FROM users WHERE email = @email');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM users WHERE id = @id');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(userData) {
        try {
            const { name, email, password } = userData;
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const pool = await poolPromise;
            const result = await pool.request()
                .input('name', sql.NVarChar, name)
                .input('email', sql.NVarChar, email)
                .input('password', sql.NVarChar, hashedPassword)
                .query('INSERT INTO users (name, email, password) OUTPUT INSERTED.id VALUES (@name, @email, @password)');
            
            return result.recordset[0].id;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;

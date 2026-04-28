// Database connection config

const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    server: process.env.DB_SERVER || '',
    database: process.env.DB_DATABASE || 'payroll_db',
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: true, // Use this if you're on Azure
        trustServerCertificate: true // Change to true for local dev / self-signed certs
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL');
        return pool;
    })
    .catch(err => {
        console.error('Database Connection Failed! Bad Config: ', err);
        process.exit(1);
    });

module.exports = {
    sql,
    poolPromise
};

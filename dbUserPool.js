const sql = require('mssql');
require('dotenv').config();

// Connection configuration for a public, read-only user
const publicConfig = {
  user: process.env.PUBLIC_SQL_USER,
  password: process.env.PUBLIC_SQL_PASSWORD,
  server: process.env.SQL_SERVER || '10.10.0.12',
  database: process.env.SQL_DATABASE || 'Lego',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// 🔐 Function to get a pool for an authenticated user
async function getUserPool(username, password) {
  const config = {
    user: username,
    password: password,
    server: process.env.SQL_SERVER || '10.10.0.12',
    database: process.env.SQL_DATABASE || 'Lego',
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  return pool;
}

// 🌐 Function to get a public connection pool
async function getPublicPool() {
  const pool = new sql.ConnectionPool(publicConfig);
  await pool.connect();
  return pool;
}

module.exports = {
  sql,
  getUserPool,
  getPublicPool,
};
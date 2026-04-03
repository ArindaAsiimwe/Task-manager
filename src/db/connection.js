const { Pool } = require('pg');

// Railway automatically provides DATABASE_URL when you provision PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,           // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

// Log connection events for monitoring
pool.on('connect', () => {
  console.log('[DB] New client connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};

require('dotenv').config();
const db = require('./connection');

const initSQL = `
-- Drop tables if exist (for re-initialization)
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE tasks (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  status      VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority    VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_users_email ON users(email);
`;

async function initDatabase() {
  try {
    console.log('Initializing database...');
    await db.query(initSQL);
    console.log(' Database initialized successfully!');
    console.log('   Table "tasks" created with columns: id, title, description, status, priority, created_at, updated_at');
  } catch (err) {
    console.error(' Database initialization failed:', err.message);
  } finally {
    db.pool.end();
  }
}

initDatabase();

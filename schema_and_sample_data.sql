-- ============================================================
-- DATABASE SCHEMA -- Task Manager Application
-- Platform: PostgreSQL (Railway-managed)
-- ============================================================

-- Users Table (Authentication)
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE tasks (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  status      VARCHAR(20) DEFAULT 'pending'
              CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority    VARCHAR(10) DEFAULT 'medium'
              CHECK (priority IN ('low', 'medium', 'high')),
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Sample user (password: "password123" hashed with bcrypt)
INSERT INTO users (name, email, password) VALUES
  ('Demo User', 'demo@example.com', '$2a$10$examplehashhere');

INSERT INTO tasks (title, description, status, priority, user_id) VALUES
  ('Set up Railway project', 'Create a new project on Railway and link GitHub repo', 'completed', 'high', 1),
  ('Configure environment variables', 'Set DATABASE_URL, API_KEY, and NODE_ENV in Railway dashboard', 'completed', 'high', 1),
  ('Provision PostgreSQL database', 'Add a PostgreSQL plugin to the Railway project', 'completed', 'high', 1),
  ('Implement CRUD API', 'Build REST API endpoints for task management', 'in_progress', 'medium', 1),
  ('Write documentation report', 'Document deployment process, challenges, and PaaS comparison', 'pending', 'medium', 1),
  ('Test CI/CD pipeline', 'Push code to GitHub and verify automatic redeployment on Railway', 'pending', 'low', 1),
  ('Review monitoring logs', 'Check Railway logs for errors and document the debugging process', 'pending', 'low', 1),
  ('Optimize database queries', 'Add indexes and optimize slow queries for scalability', 'pending', 'low', 1);

-- Verify
SELECT * FROM users;
SELECT * FROM tasks ORDER BY id;

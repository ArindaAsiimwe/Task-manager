# Database Schema and Sample Data

**Application:** Task Manager
**Database:** PostgreSQL (Railway-managed)

---

## 1. Entity Relationship Diagram

```
┌──────────────────────────┐          ┌──────────────────────────────┐
│         users            │          │           tasks              │
├──────────────────────────┤          ├──────────────────────────────┤
│ id       (PK, SERIAL)   │───┐      │ id          (PK, SERIAL)    │
│ name     (VARCHAR 100)   │   │      │ title       (VARCHAR 255)   │
│ email    (VARCHAR 255)   │   │      │ description (TEXT)          │
│ password (VARCHAR 255)   │   └─────►│ user_id     (FK → users.id) │
│ created_at (TIMESTAMP)   │          │ status      (VARCHAR 20)    │
└──────────────────────────┘          │ priority    (VARCHAR 10)    │
                                      │ created_at  (TIMESTAMP)     │
       One ──────────── Many          │ updated_at  (TIMESTAMP)     │
   (One user has many tasks)          └──────────────────────────────┘
```

---

## 2. Users Table

Stores registered user accounts. Passwords are hashed using bcrypt before storage.

```sql
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### Column Details

| Column     | Type         | Constraints             | Description                    |
| ---------- | ------------ | ----------------------- | ------------------------------ |
| id         | SERIAL       | PRIMARY KEY             | Auto-incrementing unique ID    |
| name       | VARCHAR(100) | NOT NULL                | User's full name               |
| email      | VARCHAR(255) | UNIQUE, NOT NULL        | User's email (used for login)  |
| password   | VARCHAR(255) | NOT NULL                | Bcrypt-hashed password         |
| created_at | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | Account creation time        |

---

## 3. Tasks Table

Stores tasks created by users. Each task belongs to one user via the `user_id` foreign key.

```sql
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

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_user ON tasks(user_id);
```

### Column Details

| Column      | Type         | Constraints                                | Description                    |
| ----------- | ------------ | ------------------------------------------ | ------------------------------ |
| id          | SERIAL       | PRIMARY KEY                                | Auto-incrementing unique ID    |
| title       | VARCHAR(255) | NOT NULL                                   | Task title                     |
| description | TEXT         | Nullable                                   | Optional task description      |
| status      | VARCHAR(20)  | DEFAULT 'pending', CHECK constraint        | One of: pending, in_progress, completed |
| priority    | VARCHAR(10)  | DEFAULT 'medium', CHECK constraint         | One of: low, medium, high      |
| user_id     | INTEGER      | FOREIGN KEY → users(id), ON DELETE CASCADE | Owner of the task              |
| created_at  | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP                  | Task creation time             |
| updated_at  | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP                  | Last update time               |

### Constraints

- **Status Check:** Only allows `'pending'`, `'in_progress'`, or `'completed'`
- **Priority Check:** Only allows `'low'`, `'medium'`, or `'high'`
- **Foreign Key:** `user_id` references `users(id)` — if a user is deleted, all their tasks are automatically deleted (`ON DELETE CASCADE`)

### Indexes

| Index Name          | Column     | Purpose                                    |
| ------------------- | ---------- | ------------------------------------------ |
| idx_tasks_status    | status     | Fast filtering of tasks by status          |
| idx_tasks_priority  | priority   | Fast filtering of tasks by priority        |
| idx_tasks_user      | user_id    | Fast lookup of all tasks for a given user  |
| idx_users_email     | email      | Fast user lookup during login              |

---

## 4. Sample Data

### Sample Users

| id | name                   | email               | password      | created_at          |
| -- | ---------------------- | ------------------- | ------------- | ------------------- |
| 1  | Arinda Atweta Asiimwe  | aritah185@gmail.com | *(bcrypt hash)* | 2026-04-03 17:00:00 |
| 2  | Cissy                  | cissy@gmail.com     | *(bcrypt hash)* | 2026-04-03 17:05:00 |

### Sample Tasks

| id | title                            | description                                                        | status      | priority | user_id | created_at          |
| -- | -------------------------------- | ------------------------------------------------------------------ | ----------- | -------- | ------- | ------------------- |
| 1  | Set up Railway project           | Create a new project on Railway and link GitHub repo               | completed   | high     | 1       | 2026-04-03 17:10:00 |
| 2  | Configure environment variables  | Set DATABASE_URL, API_KEY, and NODE_ENV in Railway dashboard       | completed   | high     | 1       | 2026-04-03 17:12:00 |
| 3  | Provision PostgreSQL database    | Add a PostgreSQL plugin to the Railway project                     | completed   | high     | 1       | 2026-04-03 17:14:00 |
| 4  | Implement CRUD API               | Build REST API endpoints for task management                       | in_progress | medium   | 1       | 2026-04-03 17:16:00 |
| 5  | Write documentation report       | Document deployment process, challenges, and PaaS comparison       | pending     | medium   | 1       | 2026-04-03 17:18:00 |
| 6  | Test CI/CD pipeline              | Push code to GitHub and verify automatic redeployment on Railway   | pending     | low      | 1       | 2026-04-03 17:20:00 |
| 7  | Review monitoring logs           | Check Railway logs for errors and document the debugging process   | pending     | low      | 2       | 2026-04-03 17:22:00 |
| 8  | Optimize database queries        | Add indexes and optimize slow queries for scalability              | pending     | low      | 2       | 2026-04-03 17:24:00 |

### Sample Data as SQL

```sql
-- Insert sample users (passwords would be bcrypt-hashed in practice)
INSERT INTO users (name, email, password) VALUES
  ('Arinda Atweta Asiimwe', 'aritah185@gmail.com', '$2a$10$examplehash1...'),
  ('Cissy', 'cissy@gmail.com', '$2a$10$examplehash2...');

-- Insert sample tasks
INSERT INTO tasks (title, description, status, priority, user_id) VALUES
  ('Set up Railway project', 'Create a new project on Railway and link GitHub repo', 'completed', 'high', 1),
  ('Configure environment variables', 'Set DATABASE_URL, API_KEY, and NODE_ENV in Railway dashboard', 'completed', 'high', 1),
  ('Provision PostgreSQL database', 'Add a PostgreSQL plugin to the Railway project', 'completed', 'high', 1),
  ('Implement CRUD API', 'Build REST API endpoints for task management', 'in_progress', 'medium', 1),
  ('Write documentation report', 'Document deployment process, challenges, and PaaS comparison', 'pending', 'medium', 1),
  ('Test CI/CD pipeline', 'Push code to GitHub and verify automatic redeployment on Railway', 'pending', 'low', 1),
  ('Review monitoring logs', 'Check Railway logs for errors and document the debugging process', 'pending', 'low', 2),
  ('Optimize database queries', 'Add indexes and optimize slow queries for scalability', 'pending', 'low', 2);
```

---

*End of Database Schema and Sample Data Document*

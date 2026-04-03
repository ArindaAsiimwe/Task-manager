# Task Manager — Railway PaaS Deployment

A simple Task Manager web application deployed on Railway, demonstrating PaaS cloud deployment with PostgreSQL database integration, CI/CD workflows, and monitoring.

## 🛠️ Tech Stack
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Database:** PostgreSQL (Railway-managed)
- **Logging:** Morgan (HTTP request logger)
- **PaaS:** Railway

## 🚀 Quick Start (Local Development)

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd task-manager-railway

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your local PostgreSQL credentials

# 4. Initialize database
npm run db:init

# 5. Seed sample data
npm run db:seed

# 6. Start the server
npm run dev
```

## 📡 API Endpoints

| Method | Endpoint         | Description          |
|--------|------------------|----------------------|
| GET    | `/api/health`    | Health check         |
| GET    | `/api/tasks`     | List all tasks       |
| GET    | `/api/tasks/:id` | Get a single task    |
| POST   | `/api/tasks`     | Create a new task    |
| PUT    | `/api/tasks/:id` | Update a task        |
| DELETE | `/api/tasks/:id` | Delete a task        |

### Query Filters
```
GET /api/tasks?status=pending
GET /api/tasks?priority=high
GET /api/tasks?status=in_progress&priority=medium
```

## 🗄️ Database Schema

```sql
CREATE TABLE tasks (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  status      VARCHAR(20) DEFAULT 'pending'
              CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority    VARCHAR(10) DEFAULT 'medium'
              CHECK (priority IN ('low', 'medium', 'high')),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🌐 Environment Variables

| Variable       | Description                          | Set By      |
|----------------|--------------------------------------|-------------|
| `DATABASE_URL` | PostgreSQL connection string         | Railway     |
| `PORT`         | Server port                          | Railway     |
| `NODE_ENV`     | Environment (production/development) | Railway     |
| `API_KEY`      | Secure API key                       | Manual      |

## 📦 Deployment on Railway

1. Push code to GitHub
2. Create a new project on [railway.app](https://railway.app)
3. Link your GitHub repository
4. Add a PostgreSQL plugin
5. Railway auto-detects Node.js, sets `DATABASE_URL`, and deploys

## License
MIT

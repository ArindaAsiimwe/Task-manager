# Task Manager — Railway PaaS Deployment

A simple Task Manager web application deployed on Railway, demonstrating PaaS cloud deployment with PostgreSQL database integration, CI/CD workflows, and monitoring.

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Database:** PostgreSQL (Railway-managed)
- **Logging:** Morgan (HTTP request logger)
- **PaaS:** Railway

## Quick Start (Local Development)

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

## API Endpoints

| Method | Endpoint         | Description       |
| ------ | ---------------- | ----------------- |
| GET    | `/api/health`    | Health check      |
| GET    | `/api/tasks`     | List all tasks    |
| GET    | `/api/tasks/:id` | Get a single task |
| POST   | `/api/tasks`     | Create a new task |
| PUT    | `/api/tasks/:id` | Update a task     |
| DELETE | `/api/tasks/:id` | Delete a task     |


## Environment Variables

| Variable       | Description                          | Set By  |
| -------------- | ------------------------------------ | ------- |
| `DATABASE_URL` | PostgreSQL connection string         | Railway |
| `PORT`         | Server port                          | Railway |
| `NODE_ENV`     | Environment (production/development) | Railway |
| `API_KEY`      | Secure API key                       | Manual  |


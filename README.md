# Task Manager — Railway PaaS Deployment

A simple Task Manager web application deployed on Railway, demonstrating PaaS cloud deployment with PostgreSQL database integration, CI/CD workflows, and monitoring.

## Quick Start (Local Development)

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd task-manager

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

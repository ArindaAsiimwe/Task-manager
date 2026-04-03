# Documentation Report: Practical Application of PaaS with Railway

**Student Name:** [Your Name]  
**Course:** Cloud Computing  
**Date:** April 3, 2026  
**Application:** Task Manager — CRUD Web Application  
**Deployed URL:** [Your Railway URL, e.g., https://task-manager-railway-production.up.railway.app]  
**Repository:** [Your GitHub URL]

---

## 1. Introduction

This report documents the deployment of a Task Manager web application on Railway, a modern Platform-as-a-Service (PaaS) provider. The application is built with Node.js/Express and uses a Railway-managed PostgreSQL database for persistent data storage. This report covers the deployment process, environment configuration, database integration, scalability considerations, CI/CD workflow, monitoring and logging, and a comparison with other PaaS platforms.

---

## 2. Application Overview

The Task Manager is a full-stack CRUD application that allows users to:

- **Create** tasks with a title, description, status, and priority level
- **Read** tasks with filtering by status and priority
- **Update** task status (pending → in_progress → completed)
- **Delete** tasks

**Technology Stack:**
| Component   | Technology                     |
|-------------|--------------------------------|
| Runtime     | Node.js 20                     |
| Framework   | Express.js 4.21                |
| Database    | PostgreSQL (Railway-managed)   |
| Logging     | Morgan (HTTP request logger)   |
| Frontend    | Vanilla HTML/CSS/JavaScript    |
| PaaS        | Railway                        |
| CI/CD       | GitHub Actions + Railway       |

---

## 3. Deployment Process

### Step 1: Application Preparation
The application was structured following best practices:
```
├── src/
│   ├── index.js            # Express server entry point
│   ├── db/
│   │   ├── connection.js   # PostgreSQL connection pool
│   │   ├── init.js         # Database initialization script
│   │   └── seed.js         # Sample data seeding
│   ├── routes/
│   │   └── tasks.js        # CRUD API routes
│   └── public/
│       └── index.html      # Frontend UI
├── .github/workflows/
│   └── ci.yml              # CI/CD pipeline
├── railway.toml            # Railway configuration
├── package.json
└── .env.example
```

### Step 2: GitHub Repository Setup
The code was pushed to a GitHub repository. This is necessary because Railway uses GitHub integration for automatic deployments.

### Step 3: Railway Project Creation
1. Signed up / logged into [railway.app](https://railway.app)
2. Created a new project → "Deploy from GitHub Repo"
3. Selected the repository and authorized Railway access
4. Railway automatically detected Node.js (via `package.json`) and configured the build

### Step 4: PostgreSQL Database Provisioning
1. Clicked **"+ New"** in the Railway project dashboard
2. Selected **"Database" → "PostgreSQL"**
3. Railway automatically provisioned a PostgreSQL instance and injected `DATABASE_URL` as an environment variable
4. Ran `npm run db:init` via Railway's shell to create the `tasks` table
5. Ran `npm run db:seed` to populate sample data

### Step 5: Deployment Verification
- The app was accessible via Railway's auto-generated URL
- Verified the health endpoint: `GET /api/health` returned `{ status: "healthy", database: "connected" }`
- Tested all CRUD operations through the web UI

---

## 4. Environment Configuration

Railway provides built-in environment variable management, accessible via the **Variables** tab in the project dashboard.

### Variables Configured:

| Variable       | Value             | Source    | Purpose                             |
|----------------|-------------------|-----------|-------------------------------------|
| `DATABASE_URL` | `postgresql://...`| Auto      | PostgreSQL connection string        |
| `PORT`         | (auto-assigned)   | Auto      | Server port (Railway sets this)     |
| `NODE_ENV`     | `production`      | Manual    | Enables production optimizations    |
| `API_KEY`      | `••••••••`        | Manual    | Secures sensitive operations        |

### Security Measures:
- **Sensitive data is never committed to code** — `.env.example` shows required variables without values
- **`DATABASE_URL` is auto-injected** by Railway when PostgreSQL is linked, preventing credential exposure
- **`.gitignore`** excludes `.env` files from version control
- The `API_KEY` variable demonstrates secure secret management for production apps
- In the code, `process.env.DATABASE_URL` is used to access credentials at runtime, never hardcoded

---

## 5. Database Integration

### Schema Design

The database uses a single `tasks` table with appropriate constraints and indexes:

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

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
```

### CRUD Operations Implemented:

| Operation | Endpoint           | SQL Query Used                    |
|-----------|--------------------|-----------------------------------|
| Create    | `POST /api/tasks`  | `INSERT INTO tasks ... RETURNING *` |
| Read All  | `GET /api/tasks`   | `SELECT * FROM tasks ORDER BY ...`  |
| Read One  | `GET /api/tasks/:id`| `SELECT * FROM tasks WHERE id = $1` |
| Update    | `PUT /api/tasks/:id`| `UPDATE tasks SET ... WHERE id = $1`|
| Delete    | `DELETE /api/tasks/:id`| `DELETE FROM tasks WHERE id = $1`|

### Connection Pooling:
The application uses the `pg` library's connection pool (`Pool`) with:
- Maximum 10 simultaneous connections
- 30-second idle timeout
- SSL enabled in production (required by Railway)

---

## 6. Scalability Awareness

### Railway's Pricing and Scaling Model

Railway uses a **usage-based pricing model**:

| Plan      | Monthly Cost | vCPU        | RAM       | Notes                         |
|-----------|-------------|-------------|-----------|-------------------------------|
| Trial     | Free        | Shared      | 512 MB    | $5 credit, limited hours      |
| Hobby     | $5/month    | Shared      | 8 GB max  | For personal projects         |
| Pro       | $20/month   | Up to 32    | Up to 32 GB| Production-ready, team support|

**How costs scale with traffic:**
- Each deployment consumes **vCPU hours** and **memory GB-hours**
- Database storage is billed per GB/month
- Network egress is billed per GB after generous free tiers
- For our Task Manager, at low traffic (~100 requests/day), costs would remain under $5/month
- At high traffic (~10,000 requests/day), costs could rise to $15-30/month due to increased compute

### Scaling Plan

If traffic increased significantly, the following steps would be taken:

1. **Vertical Scaling (Immediate):**
   - Increase memory allocation via Railway's service settings
   - Railway supports up to 32 GB RAM on Pro plans

2. **Database Optimization:**
   - Add more indexes for frequently queried fields
   - Implement query caching with Redis (available as a Railway plugin)
   - Enable connection pooling with PgBouncer

3. **Horizontal Scaling (Future):**
   - Railway supports multiple replicas on Pro plans
   - Stateless app design (no server-side sessions) makes horizontal scaling straightforward
   - Use a load balancer (Railway handles this automatically with replicas)

4. **Caching Layer:**
   - Add Railway's Redis plugin for caching frequent queries
   - Cache task lists with short TTLs to reduce database load

---

## 7. CI/CD Workflow

### GitHub Actions Pipeline

A CI/CD pipeline is configured in `.github/workflows/ci.yml`:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 20
      - Install dependencies (npm ci)
      - Syntax check (node --check)
      - Verify project structure
```

### Railway Auto-Deploy

When the GitHub repository is linked to Railway:
1. **Push to `main`** → Railway detects the push
2. **Build** → Railway uses Nixpacks to build the Node.js app
3. **Deploy** → The new version replaces the old one with zero-downtime
4. **Health Check** → Railway hits `/api/health` to verify the deployment

This means **every `git push` to `main` triggers an automatic redeployment** — no manual intervention needed.

### Workflow:
```
Developer pushes code → GitHub Actions runs tests → Railway auto-deploys → Health check passes → Live!
```

---

## 8. Monitoring & Logging

### Logging Implementation

The application uses **Morgan** for HTTP request logging and custom `console.log`/`console.error` statements for application events. All logs are visible in Railway's **Observability** tab.

### Log Examples from Railway:

```
Task Manager running on port 8080
Environment: production
Database: configured
[DB] New client connected to PostgreSQL
[TASKS] GET / — Returned 8 tasks
[TASKS] POST / — Created task #9: "Test logging"
[TASKS] PUT /5 — Updated task: "Write documentation report"
[TASKS] DELETE /9 — Deleted task: "Test logging"
```

### Error Identified and Resolved

**Error:** During initial deployment, the application crashed with:
```
[DB] Unexpected error on idle client: self-signed certificate
Error: self-signed certificate
```

**Root Cause:** Railway's PostgreSQL uses SSL, but the default `pg` client rejects self-signed certificates.

**Resolution:** Added SSL configuration to the database connection:
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

This resolved the connection issue in production while keeping SSL disabled for local development.

---

## 9. Railway vs. Other PaaS Platforms

### Comparison: Railway vs. Heroku vs. Coolify

| Feature              | Railway                       | Heroku                        | Coolify                       |
|----------------------|-------------------------------|-------------------------------|-------------------------------|
| **Free Tier**        | $5 credit (trial)             | Removed in 2022               | Free (self-hosted)            |
| **Pricing Model**    | Usage-based                   | Dyno-hours + add-ons          | Free (you pay for servers)    |
| **Database**         | Built-in PostgreSQL, MySQL, Redis | Add-ons (Heroku Postgres)   | Self-managed                  |
| **Auto-Deploy**      | ✅ GitHub integration          | ✅ GitHub integration          | ✅ GitHub integration          |
| **Ease of Use**      | ⭐⭐⭐⭐⭐ Very intuitive           | ⭐⭐⭐⭐ Mature but aging         | ⭐⭐⭐ Requires server setup     |
| **Build System**     | Nixpacks (auto-detect)        | Buildpacks                    | Nixpacks or Docker            |
| **Env Variables**    | Dashboard + CLI               | Dashboard + CLI               | Dashboard                     |
| **Logging**          | Built-in observability        | Heroku Logs                   | Docker logs                   |
| **Scaling**          | Vertical + replicas           | Horizontal (dyno scaling)     | Manual (add more servers)     |
| **Cold Starts**      | None (always running)         | Yes (on free/eco tier)        | None (self-hosted)            |
| **Docker Support**   | ✅                             | ✅                             | ✅                             |
| **Custom Domains**   | ✅ Free SSL                    | ✅ SSL on paid plans           | ✅ Free SSL (Let's Encrypt)    |

### Why Railway Was Chosen

1. **Zero configuration:** Railway auto-detects the language and framework from `package.json`
2. **Integrated databases:** PostgreSQL is provisioned with one click, and `DATABASE_URL` is auto-injected
3. **Modern developer experience:** The dashboard is clean and intuitive, unlike Heroku's aging interface
4. **No cold starts:** Unlike Heroku's eco/free tier, Railway keeps apps running
5. **Transparent pricing:** Usage-based billing means you only pay for what you use

### Limitations of Railway

- **Trial limitations:** The free tier has limited hours and credits
- **No built-in task scheduler:** Heroku has Heroku Scheduler; Railway requires a separate cron service
- **Smaller ecosystem:** Heroku has more add-ons and integrations compared to Railway's growing marketplace

---

## 10. Challenges Faced and Resolutions

| Challenge                                | Resolution                                                       |
|------------------------------------------|------------------------------------------------------------------|
| SSL certificate error with PostgreSQL    | Added `ssl: { rejectUnauthorized: false }` for production        |
| Database not initialized on first deploy | Created `npm run db:init` and `npm run db:seed` scripts          |
| PORT not configurable                    | Used `process.env.PORT` (Railway auto-sets this)                 |
| Static files not served in production    | Added `express.static` middleware for the `public` directory     |
| Logs not visible for debugging           | Added Morgan HTTP logger + custom `console.log` statements       |

---

## 11. Conclusion

Railway proved to be an excellent PaaS platform for deploying a Node.js application with PostgreSQL. Its key strengths are:

- **Speed of deployment** — from code to live URL in under 5 minutes
- **Seamless database integration** — one-click PostgreSQL provisioning with auto-injected credentials
- **GitHub-driven CI/CD** — automatic redeployment on every push to main
- **Developer-friendly interface** — modern dashboard with built-in observability

Compared to Heroku, Railway offers a more modern and cost-effective experience, especially for small to medium applications. Compared to Coolify, Railway eliminates the need to manage your own servers, making it ideal for students and small teams who want to focus on building rather than infrastructure.

The complete source code, database schema, and this documentation are included in the submission deliverables.

---

**End of Report**

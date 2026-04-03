require('dotenv').config();
const db = require('./connection');

const sampleTasks = [
  { title: 'Set up Railway project', description: 'Create a new project on Railway and link GitHub repo', status: 'completed', priority: 'high' },
  { title: 'Configure environment variables', description: 'Set DATABASE_URL, API_KEY, and NODE_ENV in Railway dashboard', status: 'completed', priority: 'high' },
  { title: 'Provision PostgreSQL database', description: 'Add a PostgreSQL plugin to the Railway project', status: 'completed', priority: 'high' },
  { title: 'Implement CRUD API', description: 'Build REST API endpoints for task management', status: 'in_progress', priority: 'medium' },
  { title: 'Write documentation report', description: 'Document deployment process, challenges, and PaaS comparison', status: 'pending', priority: 'medium' },
  { title: 'Test CI/CD pipeline', description: 'Push code to GitHub and verify automatic redeployment on Railway', status: 'pending', priority: 'low' },
  { title: 'Review monitoring logs', description: 'Check Railway logs for errors and document the debugging process', status: 'pending', priority: 'low' },
  { title: 'Optimize database queries', description: 'Add indexes and optimize slow queries for scalability', status: 'pending', priority: 'low' }
];

async function seedDatabase() {
  try {
    console.log('Seeding database with sample data...');

    for (const task of sampleTasks) {
      await db.query(
        'INSERT INTO tasks (title, description, status, priority) VALUES ($1, $2, $3, $4)',
        [task.title, task.description, task.status, task.priority]
      );
    }

    console.log(` Seeded ${sampleTasks.length} sample tasks`);

    // Verify
    const result = await db.query('SELECT COUNT(*) FROM tasks');
    console.log(`   Total tasks in database: ${result.rows[0].count}`);
  } catch (err) {
    console.error(' Seeding failed:', err.message);
  } finally {
    db.pool.end();
  }
}

seedDatabase();

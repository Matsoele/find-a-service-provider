import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

// Print out the connection string (hiding the password for security)
const safeUrl = process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':****@');
console.log(`🔌 Attempting to connect to: ${safeUrl}`);

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Force a test query on startup
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Connected to PostgreSQL perfectly!'))
  .catch((err) => {
    console.error('❌ DATABASE CONNECTION FAILED!');
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
  });
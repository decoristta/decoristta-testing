import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/decoristta';

// Disable prefetch as it is not supported for "Transaction" pool mode
// Configure connection pool limits to prevent exhausting database connections during traffic spikes
const client = postgres(connectionString, { 
  prepare: false,
  max: 10,              // Limit max connections per serverless instance
  idle_timeout: 20,     // Close idle connections quickly (seconds)
  connect_timeout: 10,  // Fail fast if DB is unreachable (seconds)
});

export const db = drizzle(client, { schema });

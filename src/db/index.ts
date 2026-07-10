import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/decoristta';

// Disable prefetch as it is not supported for "Transaction" pool mode.
// max is intentionally 1: we're connecting through Supabase's Transaction
// pooler (PgBouncer), which already pools connections on its end. A
// serverless function holding its own larger local pool on top of that
// fights the pooler for connections instead of cooperating with it --
// Supabase's own guidance for serverless + transaction mode is max: 1.
const client = postgres(connectionString, {
  prepare: false,
  max: 1,
  idle_timeout: 20,     // Close idle connections quickly (seconds)
  connect_timeout: 10,  // Fail fast if DB is unreachable (seconds)
});

export const db = drizzle(client, { schema });

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema.ts';

const client = createClient({
    url: process.env.NODE_ENV === 'production' ? 'DATABASE_URL' : 'file:local.db',
});

export const db = drizzle(client, { schema });
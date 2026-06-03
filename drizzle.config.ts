import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './migrations',
    dialect: 'sqlite',
    dbCredentials: {
        // This file will be generated automatically in your project folder!
        url: 'local.db',
    },
});
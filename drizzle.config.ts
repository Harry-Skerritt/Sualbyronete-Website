import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'sqlite',
    dbCredentials: {
        url: '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/a5753be68bdb194f0422226feeefdd92add00496819c0d4d3df4fb9281662566.sqlite',
    },
});
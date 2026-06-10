// src/db/index.ts
import { drizzle as d1Drizzle } from 'drizzle-orm/d1';
import * as schema from './schema.ts';
import { env } from 'cloudflare:workers';

let _db: any = null;

export function getDB() {
    if (_db) return _db;

    if (typeof env !== 'undefined' && env?.DB) {
        _db = d1Drizzle(env.DB, { schema });
        return _db;
    }

    // @ts-ignore
    const astroRuntime = globalThis[Symbol.for('astro.cloudflare.runtime')] || globalThis.__ASTRO_CLOUDFLARE_RUNTIME__;

    if (astroRuntime?.env?.DB) {
        _db = d1Drizzle(astroRuntime.env.DB, { schema });
        return _db;
    }

    const isDevScript = process.env.NODE_ENV === 'development' || !process.env.CF_PAGES;
    if (isDevScript) {
        const { createClient } = require('@libsql/client');
        const { drizzle: libsqlDrizzle } = require('drizzle-orm/libsql');

        const client = createClient({
            url: 'file:local.db',
        });
        _db = libsqlDrizzle(client, { schema });
        return _db;
    }

    throw new Error("Database environment could not be determined.");
}
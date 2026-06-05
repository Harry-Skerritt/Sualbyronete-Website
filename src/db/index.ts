// src/db/index.ts
import { drizzle as d1Drizzle } from 'drizzle-orm/d1';
import { drizzle as libsqlDrizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema.ts';


let _db: any = null;

export function getDB() {
    if (_db) return _db;

    const isDev = process.env.NODE_ENV === 'development' || !process.env.CF_PAGES;

    if (isDev) {
        const client = createClient({
            url: 'file:local.db',
        });
        _db = libsqlDrizzle(client, { schema });
        return _db;
    }

    try {
        // @ts-ignore
        const { env } = import.meta.compileTime === undefined ? require('cloudflare:workers') : {};

        if (env?.DB) {
            _db = d1Drizzle(env.DB, { schema });
            return _db;
        }
    } catch (e) {
        // Fallback catch block
    }

    throw new Error("Database environment could not be determined");
}
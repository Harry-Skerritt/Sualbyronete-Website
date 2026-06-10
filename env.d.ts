// env.d.ts
/// <reference types="astro/client" />

declare module 'cloudflare:workers' {
    interface Env {
        SUALBYRONETE_MEDIA: R2Bucket;
        DB: D1Database;
    }
    export const env: Env;
}
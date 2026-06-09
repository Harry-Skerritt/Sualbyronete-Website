// src/pages/admin/api/save-bios.ts

import type { APIRoute } from 'astro';
import { getDB } from "../../../db";
import { systemSettings } from "../../../db/schema.ts";
import { invalidateCachedData } from "../../../scripts/databaseCache.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const { yorkieBio, biewerBio } = await request.json() as { yorkieBio?: string; biewerBio?: string };

        if (yorkieBio === undefined || biewerBio === undefined) {
            return new Response(JSON.stringify({ success: false, message: "Missing data payload" }), { status: 400 });
        }

        const db = await getDB();

        // Safe D1 SQLite Upsert executions
        await Promise.all([
            db.insert(systemSettings)
                .values({ key: 'yorkie_default_bio', value: yorkieBio.trim() })
                .onConflictDoUpdate({ target: systemSettings.key, set: { value: yorkieBio.trim() } }),
            db.insert(systemSettings)
                .values({ key: 'biewer_default_bio', value: biewerBio.trim() })
                .onConflictDoUpdate({ target: systemSettings.key, set: { value: biewerBio.trim() } }),
        ]);


        invalidateCachedData();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error("Bio system save endpoint failure:", error);
        return new Response(JSON.stringify({ success: false }), { status: 500 });
    }
}
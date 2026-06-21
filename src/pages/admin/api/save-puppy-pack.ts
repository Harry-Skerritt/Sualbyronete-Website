// src/pages/admin/api/save-puppy-pack.ts
import type { APIRoute } from 'astro';
import { getDB } from '../../../db';
import { systemSettings } from '../../../db/schema';
import { invalidateCachedData } from '../../../scripts/databaseCache';
import { randomUUID } from 'crypto';

export const prerender = false;

interface PuppyPackInputItem {
    id: string;
    value: string;
    content: string;
    sortOrder: number;
    isSubItem: boolean;
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json() as { items?: PuppyPackInputItem[] };
        const { items } = body;

        if (!items || !Array.isArray(items)) {
            return new Response(
                JSON.stringify({ success: false, message: "Invalid data payload structure." }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const sanitizedItems = items.map(item => ({
            id: item.id.startsWith('new_') ? randomUUID() : item.id,
            value: item.value.trim(),
            content: item.content ? item.content.trim() : '',
            sortOrder: item.sortOrder,
            isSubItem: item.isSubItem
        }));

        const serializedJsonString = JSON.stringify(sanitizedItems);

        const db = await getDB();

        await db.insert(systemSettings)
            .values({
                key: 'puppy_pack_data',
                value: serializedJsonString
            })
            .onConflictDoUpdate({
                target: systemSettings.key,
                set: { value: serializedJsonString }
            });

        invalidateCachedData();

        return new Response(
            JSON.stringify({ success: true, message: "Puppy pack variables updated successfully!" }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
        );

    } catch (e: any) {
        console.error("CRITICAL API ROUTE ERROR: Failed to save puppy pack parameters ->", e);

        return new Response(
            JSON.stringify({ success: false, message: e.message || "Internal network database engine transaction failure." }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
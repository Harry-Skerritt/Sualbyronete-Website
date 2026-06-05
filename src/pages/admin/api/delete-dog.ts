// src/pages/admin/api/delete-dog.ts

import type { APIRoute } from "astro";
import { getDB } from "../../../db/index";
import { puppies, adults } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async ({ request }) => {
    try {
        // Parse JSON body
        const { id, type } = await request.json() as { id: string | number; type: string };
        const db = getDB();

        // Validation Check
        if (!id || !type) {
            return new Response(
                JSON.stringify({ success: false, message: "Missing required parameter fields: 'id' or 'type'" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (type === "puppy") {
            await db.delete(puppies).where(eq(puppies.id, id as any));
        } else if (type === "adult") {
            await db.delete(adults).where(eq(adults.id, id as any));
        } else {
            return new Response(
                JSON.stringify({ success: false, message: "Invalid profile type context token specified" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        return new Response(
            JSON.stringify({ success: false, message: error.message || "Internal server database execution failure." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};
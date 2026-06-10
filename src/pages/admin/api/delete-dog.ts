// src/pages/admin/api/delete-dog.ts

import type { APIRoute } from "astro";
import { getDB } from "../../../db/index";
import { puppies, adults } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { invalidateCachedData } from "../../../scripts/databaseCache.ts";
import { env } from 'cloudflare:workers';

export const POST: APIRoute = async (context) => {
    try {
        // Parse JSON body
        const { id, type } = await context.request.json() as { id: string | number; type: string };
        const db = getDB();

        // Get bucket
        // @ts-ignore
        const astroRuntime = globalThis[Symbol.for('astro.cloudflare.runtime')] || globalThis.__ASTRO_CLOUDFLARE_RUNTIME__;
        const bucket = env?.SUALBYRONETE_MEDIA || astroRuntime?.env?.SUALBYRONETE_MEDIA;

        if (!bucket) {
            throw new Error("Cloudflare R2 Bucket binding 'SUALBYRONETE_MEDIA' could not be resolved.");
        }

        // Validation Check
        if (!id || !type) {
            return new Response(
                JSON.stringify({ success: false, message: "Missing required parameter fields: 'id' or 'type'" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Delete Photo
        let imageName: string | null = null;
        let bucketPrefix = "";

        // Query DB to fetch the filename
        if (type === "puppy") {
            const [record] = await db.select({ image: puppies.image }).from(puppies).where(eq(puppies.id, id as any));
            if (record) {
                imageName = record.image;
                bucketPrefix = "images/puppies/";
            }
        } else if (type === "adult") {
            const [record] = await db.select({ image: adults.image }).from(adults).where(eq(adults.id, id as any));
            if (record) {
                imageName = record.image;
                bucketPrefix = "images/adults/";
            }
        }

        if (!imageName) {
            return new Response(JSON.stringify({ success: false, message: "Record not found" }), { status: 404 });
        }

        // Delete photo
        if (imageName && imageName !== "default.jpg") {
            const objectKey = `${bucketPrefix}${imageName}`;

            try {
                await bucket.delete(objectKey);
                console.log(`Deleted from R2: ${objectKey}`);
            } catch (err) {
                console.error(`R2 delete failed: ${objectKey}`, err);
            }
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

        invalidateCachedData();
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
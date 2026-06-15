// src/pages/admin/api/add-submit.ts
import type { APIRoute } from 'astro';
import { getDB } from '../../../db';
import { puppies, adults } from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { invalidateCachedData } from "../../../scripts/databaseCache.ts";
import { env } from 'cloudflare:workers';

export const prerender = false;

export const POST: APIRoute = async ({ request, params }) => {
    try {
        const url = new URL(request.url);
        const type = url.searchParams.get("type")?.toLowerCase().trim();

        if (type !== 'puppy' && type !== 'adult') {
            return new Response(JSON.stringify({ success: false, message: "Invalid request endpoint route type context" }), { status: 400 });
        }

        const formData = await request.formData();
        const db = await getDB();

        // Locate Bucket
        // @ts-ignore
        const astroRuntime = globalThis[Symbol.for('astro.cloudflare.runtime')] || globalThis.__ASTRO_CLOUDFLARE_RUNTIME__;
        const bucket = env?.SUALBYRONETE_MEDIA || astroRuntime?.env?.SUALBYRONETE_MEDIA;

        if (!bucket) {
            throw new Error("Cloudflare R2 Bucket binding 'SUALBYRONETE_MEDIA' could not be resolved.");
        }

        // --- Common Global Form Extractions ---
        const name = formData.get("name")?.toString();
        const breed = formData.get("breed")?.toString();
        const dob = formData.get("dob")?.toString();
        const colour = formData.get("colour")?.toString();
        const gender = formData.get("gender")?.toString();
        const regID = formData.get("regID")?.toString() || "#0000";
        const bio = formData.get("bio")?.toString() || "No bio specified";

        let calculatedSystemId: string;
        let imageFile: File | null = null;
        let r2ObjectKey = "";

        // BRANCH A: PUPPY LOOP
        if (type === "puppy") {
            const status = formData.get("status")?.toString();
            const availableFrom = formData.get("availableFrom")?.toString();

            const mother = formData.get("mother")?.toString();
            const father = formData.get("father")?.toString();

            imageFile = formData.get("puppyImage") as File | null;

            if (!name || !breed || !status || !dob || !availableFrom || !colour || !gender || !mother || !father || !imageFile) {
                return new Response(JSON.stringify({ success: false, message: "Validation Error: Missing required puppy parameters" }), { status: 400 });
            }

            await db.insert(puppies).values({
                breed: breed as any,
                name, gender, colour, status, dob, mother, father, availableFrom, regID, bio,
                image: "placeholder-pending.jpg"
            });

            const activeRows = await db.select().from(puppies).orderBy(desc(puppies.seqID)).limit(1);
            const savedPuppy = activeRows[0];
            if (!savedPuppy) throw new Error("Synchronization mismatch on puppy fetch return loop");

            calculatedSystemId = savedPuppy.id;

            const fileExtension = imageFile.name.substring(imageFile.name.lastIndexOf('.')) || '.jpg';
            r2ObjectKey = `images/puppies/${calculatedSystemId}${fileExtension}`;

            // Update database image string field with the clean file name or key path
            await db.update(puppies).set({ image: `${calculatedSystemId}${fileExtension}` }).where(eq(puppies.seqID, savedPuppy.seqID));
        }

        // BRANCH B: ADULT LOOP
        else {
            const forSaleStr = formData.get("forSale")?.toString();
            const isDeadStr = formData.get("isDead")?.toString();
            const deathDateRaw = formData.get("deathDate")?.toString();

            imageFile = formData.get("parentImage") as File | null;

            if (!name || !breed || !dob || !forSaleStr || !colour || !gender || !isDeadStr || !imageFile) {
                return new Response(JSON.stringify({ success: false, message: "Validation Error: Missing required parent fields" }), { status: 400 });
            }

            const isForSale = forSaleStr === "true";
            const isDead = isDeadStr === "true";
            const deathDate = isDead && deathDateRaw?.trim() ? deathDateRaw.trim() : null;

            await db.insert(adults).values({
                breed: breed as any,
                gender, name, colour, dob, regID, bio,
                forSale: isForSale,
                image: "placeholder-pending.jpg",

                isDead,
                deathDate,
                hasGenetics: false
            });

            const activeRows = await db.select().from(adults).orderBy(desc(adults.seqId)).limit(1);
            const savedParent = activeRows[0];
            if (!savedParent) throw new Error("Synchronization mismatch on adult parent fetch return loop");

            calculatedSystemId = savedParent.id;
            const fileExtension = imageFile.name.substring(imageFile.name.lastIndexOf('.')) || '.jpg';
            r2ObjectKey = `images/adults/${calculatedSystemId}${fileExtension}`;

            // Update database image string field
            await db.update(adults).set({ image: `${calculatedSystemId}${fileExtension}` }).where(eq(adults.seqId, savedParent.seqId));}

        const arrayBuffer = await imageFile.arrayBuffer();
        const binaryBuffer = new Uint8Array(arrayBuffer);

        await bucket.put(r2ObjectKey, binaryBuffer, {
            httpMetadata: {
                contentType: imageFile.type || 'image/jpeg'
            }
        });
        console.log(`[R2 Storage] Added fresh resource key entry: ${r2ObjectKey}`);

        invalidateCachedData();

        const r2PublicDomain = "https://sualbyronete.co.uk/";
        const absoluteImageUrl = `${r2PublicDomain}${r2ObjectKey}`;

        return new Response(JSON.stringify({
            success: true,
            generatedId: calculatedSystemId,
            imageUrl: absoluteImageUrl,
        }),
            { status: 200, headers: { "Content-Type": "application/json" } });

    } catch (error: any) {
        console.error("Unified API management loop failure:", error);
        return new Response(JSON.stringify({ success: false, message: error.message || "Internal Server Transaction Error" }), { status: 500 });
    }
};
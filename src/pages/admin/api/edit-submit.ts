// src/pages/api/manage/edit-submit.ts
import type { APIRoute } from 'astro';
import { getDB } from '../../../db';
import { puppies, adults } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { env } from 'cloudflare:workers';
import { invalidateCachedData } from "../../../scripts/databaseCache.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request, params }) => {
    try {
        const url = new URL(request.url);
        const type = url.searchParams.get("type")?.toLowerCase().trim();

        if (type !== 'puppy' && type !== 'adult') {
            return new Response(JSON.stringify({ success: false, message: "Invalid route type operational context." }), { status: 400 });
        }

        const formData = await request.formData();
        const db = await getDB();

        // Get Bucket
        // @ts-ignore
        const astroRuntime = globalThis[Symbol.for('astro.cloudflare.runtime')] || globalThis.__ASTRO_CLOUDFLARE_RUNTIME__;
        const bucket = env?.SUALBYRONETE_MEDIA || astroRuntime?.env?.SUALBYRONETE_MEDIA;

        if (!bucket) {
            return new Response(JSON.stringify({ success: false, message: "R2 Storage connection unlinked." }), { status: 500 });
        }

        // --- Core ID Extraction ---
        const oldId = formData.get("id")?.toString()?.trim();
        if (!oldId) {
            return new Response(JSON.stringify({ success: false, message: "Missing profile target identification key." }), { status: 400 });
        }

        // --- Common Global Form Extractions ---
        const name = formData.get("name")?.toString();
        const breed = formData.get("breed")?.toString();
        const dob = formData.get("dob")?.toString();
        const colour = formData.get("colour")?.toString();
        const gender = formData.get("gender")?.toString();
        const regID = formData.get("regID")?.toString() || "#0000";
        const bio = formData.get("bio")?.toString() || "No bio specified";

        let bucketPrefix = "";
        let uniqueFileName = "";
        let imageFile: File | null = null;
        let oldImageName: string | undefined = undefined;
        let finalGeneratedId = "";

        // BRANCH A: PUPPY LOOP
        if (type === "puppy") {
            const status = formData.get("status")?.toString();
            const availableFrom = formData.get("availableFrom")?.toString();
            const mother = formData.get("mother")?.toString();
            const father = formData.get("father")?.toString();
            imageFile = formData.get("puppyImage") as File | null;

            if (!name || !breed || !status || !dob || !availableFrom || !colour || !gender || !mother || !father) {
                return new Response(JSON.stringify({ success: false, message: "Validation Error: Missing required puppy properties" }), { status: 400 });
            }

            const preUpdateRecords = await db.select().from(puppies).where(eq(puppies.id, oldId));
            if (preUpdateRecords.length > 0) {
                oldImageName = preUpdateRecords[0].image;
            }

            await db.update(puppies)
                .set({
                    name,
                    breed: breed as any,
                    status,
                    dob,
                    availableFrom,
                    colour,
                    gender,
                    mother,
                    father,
                    regID,
                    bio
                })
                .where(eq(puppies.id, oldId));

            const [postUpdateRecord] = await db.select({ id: puppies.id }).from(puppies).where(eq(puppies.name, name));
            finalGeneratedId = postUpdateRecord?.id || oldId;

            bucketPrefix = "images/puppies";
            const rawFileName = imageFile?.name || oldImageName || '.jpg';
            const fileExtension = rawFileName.includes('.') ? rawFileName.substring(rawFileName.lastIndexOf('.')) : '.jpg';
            uniqueFileName = `${finalGeneratedId}${fileExtension.toLowerCase()}`;

            await db.update(puppies).set({ image: uniqueFileName }).where(eq(puppies.id, finalGeneratedId));
        }

        // BRANCH B: ADULT LOOP
        else {
            const forSaleStr = formData.get("forSale")?.toString();
            imageFile = formData.get("parentImage") as File | null;

            if (!name || !breed || !dob || !forSaleStr || !colour || !gender) {
                return new Response(JSON.stringify({ success: false, message: "Validation Error: Missing required adult fields" }), { status: 400 });
            }

            const isForSale = forSaleStr === "true" || forSaleStr === "1";

            const preUpdateRecords = await db.select().from(adults).where(eq(adults.id, oldId));
            if (preUpdateRecords.length === 0) {
                return new Response(JSON.stringify({ success: false, message: "Adult profile not found." }), { status: 404 });
            }

            const targetSeqId = preUpdateRecords[0].seqId;
            oldImageName = preUpdateRecords[0].image;

            await db.update(adults)
                .set({
                    name,
                    breed: breed as any,
                    gender,
                    colour,
                    dob,
                    regID,
                    forSale: isForSale,
                    bio
                })
                .where(eq(adults.id, oldId));


            const [postUpdateRecord] = await db.select({ id: adults.id }).from(adults).where(eq(adults.seqId, targetSeqId));
            finalGeneratedId = postUpdateRecord.id;

            bucketPrefix = "images/adults";
            const rawFileName = imageFile?.name || oldImageName || '.jpg';
            const fileExtension = rawFileName.includes('.') ? rawFileName.substring(rawFileName.lastIndexOf('.')) : '.jpg';
            uniqueFileName = `${finalGeneratedId}${fileExtension.toLowerCase()}`;

            await db.update(adults).set({ image: uniqueFileName }).where(eq(adults.id, finalGeneratedId));
        }

        // UNIFIED IMAGE FS IO STREAM WRITE WRAPPER
        if (bucketPrefix && uniqueFileName) {
            const oldObjectKey = oldImageName ? `${bucketPrefix}/${oldImageName}` : "";
            const newObjectKey = `${bucketPrefix}/${uniqueFileName}`;

            // Case 1: Fresh image file uploaded via the edit form
            if (imageFile && imageFile.size > 0) {
                // Remove old image
                if (oldObjectKey && oldObjectKey !== newObjectKey && oldImageName !== "default.jpg") {
                    try {
                        await bucket.delete(oldObjectKey);
                    } catch {}
                }

                // Convert file data to absolute local binary array
                const arrayBuffer = await imageFile.arrayBuffer();
                const binaryBuffer = new Uint8Array(arrayBuffer);

                await bucket.put(newObjectKey, binaryBuffer, {
                    httpMetadata: { contentType: imageFile.type || 'image/jpeg' }
                });
                console.log(`[R2 Storage] Overwrote image file target: ${newObjectKey}`);
            }
            else if (oldObjectKey && oldObjectKey !== newObjectKey && oldImageName !== "default.jpg") {
                try {
                    const existingObject = await bucket.get(oldObjectKey);
                    if (existingObject) {
                        const objectDataBuffer = await existingObject.arrayBuffer();

                        await bucket.put(newObjectKey, new Uint8Array(objectDataBuffer), {
                            httpMetadata: { contentType: 'image/jpeg' }
                        });

                        await bucket.delete(oldObjectKey);
                        console.log(`[R2 Storage] Synced profile key shift from ${oldObjectKey} to ${newObjectKey}`);
                    }
                } catch (err) {
                    console.error("[R2 Storage Error] Image identity synchronization failed:", err);
                }
            }
        }

        invalidateCachedData();
        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error: any) {
        console.error("Unified API execution modification error:", error);
        return new Response(JSON.stringify({ success: false, message: error.message || "Internal Server Transaction Error" }), { status: 500 });
    }
};
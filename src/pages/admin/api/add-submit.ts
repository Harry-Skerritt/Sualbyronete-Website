// src/pages/admin/api/add-submit.ts
import type { APIRoute } from 'astro';
import { getDB } from '../../../db';
import { puppies, adults } from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
import { invalidateCachedData } from "../../../scripts/databaseCache.ts";

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
        let targetDirectory = "";
        let uniqueFileName = "";

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

            targetDirectory = path.join(process.cwd(), 'public', 'images', 'puppies');

            const fileExtension = path.extname(imageFile.name) || '.jpg';
            uniqueFileName = `${calculatedSystemId}${fileExtension}`;

            // Update database image string field
            await db.update(puppies).set({ image: uniqueFileName }).where(eq(puppies.seqID, savedPuppy.seqID));
        }

        // BRANCH B: ADULT LOOP
        else {
            const forSaleStr = formData.get("forSale")?.toString();
            imageFile = formData.get("parentImage") as File | null;

            if (!name || !breed || !dob || !forSaleStr || !colour || !gender || !imageFile) {
                return new Response(JSON.stringify({ success: false, message: "Validation Error: Missing required parent fields" }), { status: 400 });
            }

            const isForSale = forSaleStr === "true";

            await db.insert(adults).values({
                breed: breed as any,
                gender, name, colour, dob, regID, bio,
                forSale: isForSale,
                image: "placeholder-pending.jpg"
            });

            const activeRows = await db.select().from(adults).orderBy(desc(adults.seqId)).limit(1);
            const savedParent = activeRows[0];
            if (!savedParent) throw new Error("Synchronization mismatch on adult parent fetch return loop");

            calculatedSystemId = savedParent.id;
            targetDirectory = path.join(process.cwd(), 'public', 'images', 'adults');

            const fileExtension = path.extname(imageFile.name) || '.jpg';
            uniqueFileName = `${calculatedSystemId}${fileExtension}`;

            // Update database image string field
            await db.update(adults).set({ image: uniqueFileName }).where(eq(adults.seqId, savedParent.seqId));
        }

        // UNIFIED IMAGE FS IO STREAM WRITE WRAPPER
        await fs.mkdir(targetDirectory, { recursive: true });
        const fileArrayBuffer = await imageFile.arrayBuffer();
        await fs.writeFile(path.join(targetDirectory, uniqueFileName), Buffer.from(fileArrayBuffer));

        invalidateCachedData();
        return new Response(JSON.stringify({ success: true, generatedId: calculatedSystemId }), { status: 200 });

    } catch (error: any) {
        console.error("Unified API management loop failure:", error);
        return new Response(JSON.stringify({ success: false, message: error.message || "Internal Server Transaction Error" }), { status: 500 });
    }
};
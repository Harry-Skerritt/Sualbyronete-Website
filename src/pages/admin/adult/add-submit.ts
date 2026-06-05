// src/pages/admin/adult/add-submit.ts
import type { APIRoute } from 'astro';
import { getDB } from '../../../db';
import { adults } from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();

        const name = formData.get("name")?.toString();
        const breed = formData.get("breed")?.toString();
        const dob = formData.get("dob")?.toString();
        const forSaleStr = formData.get("forSale")?.toString();
        const colour = formData.get("colour")?.toString();
        const gender = formData.get("gender")?.toString();
        const regID = formData.get("regID")?.toString() || "#0000";
        const imageFile = formData.get("parentImage") as File | null;
        const bio = formData.get("bio")?.toString() || "No bio specified";

        if (!name || !breed || !dob || !forSaleStr || !colour || !gender || !imageFile) {
            return new Response(JSON.stringify({ success: false, message: "Server-side Validation Error: Missing required fields" }), { status: 400 });
        }

        const isForSale = forSaleStr === "true";
        const db = await getDB();

        // Insert initial row to generate serial auto-increment tracking
        await db.insert(adults).values({
            breed: breed as "state-one" | "state-two",
            gender: gender,
            name: name,
            colour: colour,
            dob: dob,
            regID: regID,
            forSale: isForSale,
            image: "placeholder-pending.jpg",
            bio: bio,
        });

        // Retrieve row to catch computed virtual ID format
        const activeRows = await db.select()
            .from(adults)
            .orderBy(desc(adults.seqId))
            .limit(1);

        const savedParent = activeRows[0];
        if (!savedParent) {
            throw new Error("Database row synchronization failure on parent return fetch loop");
        }

        const calculatedSystemId = savedParent.id;

        // Write binary stream directly to targeted public folder path
        const targetDirectory = path.join(process.cwd(), 'public', 'images', 'adults');
        const fileExtension = path.extname(imageFile.name) || '.jpg';
        const uniqueFileName = `${calculatedSystemId}${fileExtension}`;
        const fullWritePath = path.join(targetDirectory, uniqueFileName);

        await fs.mkdir(targetDirectory, { recursive: true });

        const fileArrayBuffer = await imageFile.arrayBuffer();
        await fs.writeFile(fullWritePath, Buffer.from(fileArrayBuffer));

        // Update row setting only the raw image file name
        await db.update(adults)
            .set({ image: uniqueFileName })
            .where(eq(adults.seqId, savedParent.seqId));

        return new Response(JSON.stringify({ success: true, generatedId: calculatedSystemId }), { status: 200 });

    } catch (error: any) {
        console.error("Full-stack parent addition route endpoint failure:", error);
        return new Response(JSON.stringify({ success: false, message: error.message || "Internal Server Transaction Error" }), { status: 500 });
    }
};
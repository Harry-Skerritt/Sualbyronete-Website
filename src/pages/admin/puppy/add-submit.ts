// src/pages/admin/puppy/add-submit.ts
import type { APIRoute } from 'astro';
import { getDB } from '../../../db';
import { puppies } from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();

        const name = formData.get("name")?.toString();
        const breed = formData.get("breed")?.toString();
        const status = formData.get("status")?.toString();
        const dob = formData.get("dob")?.toString();
        const availableFrom = formData.get("availableFrom")?.toString();
        const colour = formData.get("colour")?.toString();
        const gender = formData.get("gender")?.toString();
        const mother = formData.get("mother")?.toString();
        const father = formData.get("father")?.toString();
        const regID = formData.get("regID")?.toString() || "#0000";
        const imageFile = formData.get("puppyImage") as File | null;
        const bio = formData.get("bio")?.toString() || "No bio specified";

        if (!name || !breed || !status || !dob || !availableFrom || !colour || !gender || !mother || !father || !imageFile) {
            return new Response(JSON.stringify({ success: false, message: "Server-side Validation Error: Missing required structural field updates." }), { status: 400 });
        }

        const db = await getDB();

        // Insert initial row to generate serial auto-increment tracking
        await db.insert(puppies).values({
            breed: breed as "state-one" | "state-two",
            name: name,
            gender: gender,
            colour: colour,
            status: status,
            image: "placeholder-pending.jpg",
            dob: dob,
            mother: mother,
            father: father,
            availableFrom: availableFrom,
            regID: regID,
            bio: bio
        });

        // Retrieve row to catch computed virtual ID format
        const activeRows = await db.select()
            .from(puppies)
            .orderBy(desc(puppies.seqID))
            .limit(1);

        const savedPuppy = activeRows[0];
        if (!savedPuppy) {
            throw new Error("Critical Failure: Database row synchronization mismatch on fetch return transaction loops");
        }

        const calculatedSystemId = savedPuppy.id;

        // Write binary stream directly to targeted public folder path
        const folderSlug = breed.toLowerCase() === 'yorkie' ? 'yorkies' : 'biewers';
        const targetDirectory = path.join(process.cwd(), 'public', 'images', 'puppies', folderSlug);

        const fileExtension = path.extname(imageFile.name) || '.jpg';
        const uniqueFileName = `${calculatedSystemId}${fileExtension}`;
        const fullWritePath = path.join(targetDirectory, uniqueFileName);

        await fs.mkdir(targetDirectory, { recursive: true });

        const fileArrayBuffer = await imageFile.arrayBuffer();
        await fs.writeFile(fullWritePath, Buffer.from(fileArrayBuffer));

        // Update row setting only the raw image file name
        await db.update(puppies)
            .set({ image: uniqueFileName })
            .where(eq(puppies.seqID, savedPuppy.seqID));

        return new Response(JSON.stringify({ success: true, generatedId: calculatedSystemId }), { status: 200 });

    } catch (error: any) {
        console.error("Full-stack API endpoint addition loop failure:", error);
        return new Response(JSON.stringify({ success: false, message: error.message || "Internal Server Transaction Error" }), { status: 500 });
    }
};
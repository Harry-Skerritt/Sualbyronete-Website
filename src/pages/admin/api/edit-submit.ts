// src/pages/api/manage/edit-submit.ts
import type { APIRoute } from 'astro';
import { getDB } from '../../../db';
import { puppies, adults } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
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

        let targetDirectory = "";
        let uniqueFileName = "";
        let imageFile: File | null = null;

        let oldImageName: string | undefined = undefined;
        let finalGeneratedId = oldId; // Defaults to old ID unless modified

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

            const numericSuffix = oldId.replace(/^[a-zA-Z]+/, "");
            const prefix = breed.toLowerCase() === 'yorkie' ? 'YT' : 'BT';
            finalGeneratedId = `${prefix}${numericSuffix}`;

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


            targetDirectory = path.join(process.cwd(), 'public', 'images', 'puppies');

            const fileExtension = (imageFile && imageFile.size > 0)
                ? path.extname(imageFile.name)
                : (oldImageName ? path.extname(oldImageName) : '.jpg');

            uniqueFileName = `${finalGeneratedId}${fileExtension}`;
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
            if (preUpdateRecords.length > 0) {
                oldImageName = preUpdateRecords[0].image;
            }

            const numericSuffix = oldId.replace(/^[a-zA-Z]+/, "");
            const prefix = breed.toLowerCase() === 'yorkie' ? 'YT' : 'BT';
            finalGeneratedId = `${prefix}${numericSuffix}`;

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


            targetDirectory = path.join(process.cwd(), 'public', 'images', 'adults');

            const fileExtension = (imageFile && imageFile.size > 0)
                ? path.extname(imageFile.name)
                : (oldImageName ? path.extname(oldImageName) : '.jpg');

            uniqueFileName = `${finalGeneratedId}${fileExtension}`;
            await db.update(adults).set({ image: uniqueFileName }).where(eq(adults.id, finalGeneratedId));
        }

        // UNIFIED IMAGE FS IO STREAM WRITE WRAPPER
        if (targetDirectory && uniqueFileName) {
            await fs.mkdir(targetDirectory, { recursive: true });

            const oldFilePath = oldImageName ? path.join(targetDirectory, oldImageName) : "";
            const newFilePath = path.join(targetDirectory, uniqueFileName);

            if (imageFile && imageFile.size > 0) {
                if (oldFilePath && oldFilePath !== newFilePath) {
                    try {
                        await fs.access(oldFilePath);
                        await fs.unlink(oldFilePath);
                    } catch {}
                }
                const fileArrayBuffer = await imageFile.arrayBuffer();
                await fs.writeFile(newFilePath, Buffer.from(fileArrayBuffer));
                console.log(`[Storage IO] Wrote uploaded photo file down: ${uniqueFileName}`);
            }
            else if (oldFilePath && oldFilePath !== newFilePath) {
                try {
                    await fs.access(oldFilePath);
                    await fs.copyFile(oldFilePath, newFilePath);
                    await fs.unlink(oldFilePath);
                } catch (err) {
                    console.error("[Storage Error] Physical identity file sync lifecycle failed:", err);
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
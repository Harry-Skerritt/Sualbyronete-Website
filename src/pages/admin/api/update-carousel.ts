// src/pages/admin/api/update-carousel.ts

import type { APIRoute } from "astro";
import { getDB } from "../../../db/index";
import { puppies } from "../../../db/schema";
import { eq, inArray } from "drizzle-orm";

export const POST: APIRoute = async ({ request, redirect }) => {
    try {
        const formData = await request.formData();
        const db = getDB();

        // Fetch puppy IDs and current carousel status from the DB
        const currentPuppies = await db
            .select({
                id: puppies.id,
                showInCarousel: puppies.showInCarousel
            })
            .from(puppies);

        const updatePromises = [];

        // Loop through each puppy to check if toggle state changed
        for (const pup of currentPuppies) {
            const formValue = formData.get(`carousel-${pup.id}`);
            const submittedState = formValue !== null;

            if (pup.showInCarousel !== submittedState) {
                const query = db
                    .update(puppies)
                    .set({ showInCarousel: submittedState })
                    .where(eq(puppies.id, pup.id));

                updatePromises.push(query);
            }
        }


        if (updatePromises.length > 0) {
            await Promise.all(updatePromises);
        }

        return new Response(
            JSON.stringify({ success: true, updatedCount: updatePromises.length }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    }catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ success: false, error: "Failed to save changes" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};
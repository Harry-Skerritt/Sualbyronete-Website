// src/scripts/getFeaturedPuppies.ts

import { getDB } from "../db/index.ts";
import { puppies } from "../db/schema";
import { eq } from "drizzle-orm";
import { formatGender, getColourLabel } from "../config/puppyConstants";
import { calculateAge } from "./ageCalculator";

export interface CarouselImageItem {
    src: string;
    alt: string;
    title: string;
    subtitle: string;
}

export async function getCarouselGallery(): Promise<CarouselImageItem[]> {
    try {
        const db = getDB();

        const carouselPuppies = await db
            .select()
            .from(puppies)
            .where(eq(puppies.showInCarousel, true));

        return carouselPuppies.map((pup: any) => {
            const displayBreed = pup.breed.toLowerCase() === 'yorkie' ? 'Yorkshire Terrier' : 'Biewer Terrier';

            return {
                src: `/images/puppies/${pup.image}`,
                alt: `${displayBreed} Puppy named ${pup.name}`,
                title: formatGender(pup.name),
                subtitle: `${displayBreed} | ${calculateAge(pup.dob)}`
            };
        });
    } catch (error) {
        console.error("Failed to compile carousel asset data paths:", error);
        return [];
    }
}
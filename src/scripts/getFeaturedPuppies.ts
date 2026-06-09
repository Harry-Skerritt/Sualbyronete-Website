// src/scripts/getFeaturedPuppies.ts

import { getCachedData } from "./databaseCache.ts";
import {formatGender, getColourLabel, getFormattedBreed} from "../config/puppyConstants";
import { calculateAge } from "./ageCalculator";

export interface CarouselImageItem {
    src: string;
    alt: string;
    title: string;
    subtitle: string;
    puppyID?: string;
}

export async function getCarouselGallery(): Promise<CarouselImageItem[]> {
    try {
        const { allPuppies } = await getCachedData();

        const carouselPuppies = allPuppies.filter((pup:any) => pup.showInCarousel === true);

        return carouselPuppies.map((pup: any) => {
            return {
                src: `/images/puppies/${pup.image}`,
                alt: `${getFormattedBreed(pup.breed)} Puppy named ${pup.name}`,
                title: formatGender(pup.name),
                subtitle: `${getFormattedBreed(pup.breed)} | ${calculateAge(pup.dob)}`,
                puppyID: pup.id
            };
        });
    } catch (error) {
        console.error("Failed to compile carousel asset data paths:", error);
        return [];
    }
}
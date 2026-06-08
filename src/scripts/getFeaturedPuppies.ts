// src/scripts/getFeaturedPuppies.ts

import { getCachedData } from "./databaseCache.ts";
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
        const { allPuppies } = await getCachedData();

        const carouselPuppies = allPuppies.filter((pup:any) => pup.showInCarousel === true);

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
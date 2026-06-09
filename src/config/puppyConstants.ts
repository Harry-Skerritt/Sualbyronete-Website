// src/config/puppyConstants.ts
import { PUPPY_COLOURS } from "./siteSettings.ts";

export const formatGender = (gender: string): string => {
        if (!gender) return "";
        const clean = gender.trim();
        return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
};

export const getColourLabel = (dbValue: string): string => {
        if (!dbValue) return "";
        const cleanValue = dbValue.toLowerCase().trim();
        const match = PUPPY_COLOURS.find(item => item.value === cleanValue);
        return match ? match.label : dbValue;
};

export const getFormattedBreed = (breed: string): string => {
        const normalisedBreed = breed?.toLowerCase().trim();
        const isYorkie = normalisedBreed === "yorkie" || normalisedBreed === "yorkshire terrier";
        return isYorkie ? "Yorkshire Terrier" : "Biewer Terrier";
};
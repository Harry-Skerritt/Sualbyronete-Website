// src/config/puppyConstants.ts

export const PUPPY_COLOURS = [
        { value: "black-tan",        label: "Black & Tan",          breed: "Yorkie" },
        { value: "steel-blue-tan",   label: "Steel Blue & Tan",     breed: "Yorkie" },
        { value: "black",            label: "Black",                breed: "Biewer" },
        { value: "black-tan",        label: "Black & Tan",          breed: "Biewer" },

]

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
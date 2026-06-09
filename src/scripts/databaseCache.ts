// src/scripts/databaseCache.ts

import { getDB } from "../db";
import { puppies, adults, systemSettings } from "../db/schema.ts";

interface CachedData {
    allPuppies: any[];
    parents: any[];
    defaultBios: { yorkie: string; biewer: string };
    lastFetched: number;
}

let databaseMemoryCache: CachedData | null = null;

// 2 mins in ms <- Can increase if there are issues
const CACHE_TTL = 2 * 60 * 1000;

export async function getCachedData(forceRefresh = false) {
    const now = Date.now();

    if (!forceRefresh && databaseMemoryCache && (now - databaseMemoryCache.lastFetched < CACHE_TTL)) {
        return {
            allPuppies: databaseMemoryCache.allPuppies,
            parents: databaseMemoryCache.parents,
            defaultBios: databaseMemoryCache.defaultBios,
            fromCache: true
        };
    }

    const freshData = await fetchFreshRows();

    databaseMemoryCache = {
        allPuppies: freshData.allPuppies,
        parents: freshData.parents,
        defaultBios: freshData.defaultBios,
        lastFetched: now
    };


    return {
        ...freshData,
        fromCache: false
    };
}

export function invalidateCachedData() {
    databaseMemoryCache = null;
}

async function fetchFreshRows() {
    const db = await getDB();
    const [puppyRows, adultRows, settingsRows] = await Promise.all([
        db.select().from(puppies),
        db.select().from(adults),
        db.select().from(systemSettings),
    ]);

    const defaultBios = {
        yorkie: settingsRows.find((row: any) => row.key === 'yorkie_default_bio')?.value || "No default Yorkshire Terrier bio configured yet.",
        biewer: settingsRows.find((row: any) => row.key === 'biewer_default_bio')?.value || "No default Biewer Terrier bio configured yet."
    };

    return {
        allPuppies: puppyRows,
        parents: adultRows,
        defaultBios,
    };
}
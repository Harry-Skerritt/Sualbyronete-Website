// src/scripts/databaseCache.ts

import { getDB } from "../db";
import { puppies, adults } from "../db/schema.ts";

interface CachedData {
    allPuppies: any[];
    parents: any[];
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
            fromCache: true
        };
    }

    const freshData = await fetchFreshRows();

    databaseMemoryCache = {
        allPuppies: freshData.allPuppies,
        parents: freshData.parents,
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
    const [puppyRows, adultRows] = await Promise.all([
        db.select().from(puppies),
        db.select().from(adults),
    ]);
    return { allPuppies: puppyRows, parents: adultRows };
}
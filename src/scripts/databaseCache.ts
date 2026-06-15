// src/scripts/databaseCache.ts

import { getDB } from "../db";
import { puppies, adults, systemSettings, genetics } from "../db/schema.ts";
import { PUPPY_INCLUSIONS, YORKIE_DEFAULT_BIO, BIEWER_DEFAULT_BIO } from "../config/siteSettings.ts";

interface CachedData {
    allPuppies: any[];
    parents: any[];
    geneticsData: any[];
    defaultBios: { yorkie: string; biewer: string };
    puppyPack: any[];
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
            geneticsData: databaseMemoryCache.geneticsData,
            defaultBios: databaseMemoryCache.defaultBios,
            puppyPack: databaseMemoryCache.puppyPack,
            fromCache: true
        };
    }

    const freshData = await fetchFreshRows();

    databaseMemoryCache = {
        allPuppies: freshData.allPuppies,
        parents: freshData.parents,
        geneticsData: freshData.geneticsData,
        defaultBios: freshData.defaultBios,
        puppyPack: freshData.puppyPack,
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
    const [puppyRows, adultRows, settingsRows, geneticsRows] = await Promise.all([
        db.select().from(puppies),
        db.select().from(adults),
        db.select().from(systemSettings),
        db.select().from(genetics),
    ]);

    // Bios
    const defaultBios = {
        yorkie: settingsRows.find((row: any) => row.key === 'yorkie_default_bio')?.value || YORKIE_DEFAULT_BIO,
        biewer: settingsRows.find((row: any) => row.key === 'biewer_default_bio')?.value || BIEWER_DEFAULT_BIO,
    };

    // Puppy Pack
    const packRecord = settingsRows.find((row: any) => row.key === 'puppy_pack_data');
    let puppyPack = PUPPY_INCLUSIONS;

    if (packRecord && packRecord.value) {
        try {
            puppyPack = JSON.parse(packRecord.value);
        } catch (e) {
            console.error("Failed to parse puppy_pack_data JSON from systemSettings, using config defaults.", e);
        }
    }

    return {
        allPuppies: puppyRows,
        parents: adultRows,
        geneticsData: geneticsRows,
        defaultBios,
        puppyPack,
    };
}
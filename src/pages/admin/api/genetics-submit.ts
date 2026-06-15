// src/pages/admin/api/genetics-submit.ts

import type { APIRoute } from "astro";
import { getDB } from "../../../db";
import { genetics, adults } from "../../../db/schema.ts";
import { eq } from "drizzle-orm";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";

interface BreedGenetic {
    breed: string;
    value: string;
}

interface GeneticsSubmitBody {
    adultId: string;
    atRiskCount: number;
    carrierCount: number;
    clearCount: number;
    dogCoI: string;
    breedAverage: string | null;
    coiHistory: {
        generations: string;
        complete: string;
    };
    atRiskDetails: Array<{ id: string; dogEffects: string }>;
    carrierDetails: Array<{ id: string; dogEffects: string }>;
    clearDetails: Array<{ id: string; dogEffects: string }>;
    breedGeneticsSummary: [BreedGenetic, BreedGenetic, BreedGenetic];
}

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
    try {
        const body = await request.json() as GeneticsSubmitBody;
        const actionQuery = url.searchParams.get('action') || 'add';

        const {
            adultId,
            atRiskCount,
            carrierCount,
            clearCount,
            dogCoI,
            breedAverage,
            coiHistory,
            atRiskDetails,
            carrierDetails,
            clearDetails,
            breedGeneticsSummary
        } = body;

        if (!adultId) {
            return new Response(JSON.stringify({ success: false, message: "Missing Adult Identification binding code." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const db = getDB();

        const geneticsDataValues = {
            atRiskCount,
            carrierCount,
            clearCount,
            atRiskDetails,
            carrierDetails,
            clearDetails,
            breedGeneticsSummary,
            dogCoI,
            breedAverage,
            coiHistory
        };

        const existingRecord = await db.select()
            .from(genetics)
            .where(eq(genetics.adultId, adultId))
            .get();

        let geneticsQuery;
        if (actionQuery === 'edit' || existingRecord) {
            geneticsQuery = db.update(genetics)
                .set(geneticsDataValues)
                .where(eq(genetics.adultId, adultId));
        } else {
            geneticsQuery = db.insert(genetics)
                .values({
                    adultId,
                    ...geneticsDataValues,
                });
        }

        const adultUpdateQuery = db.update(adults)
               .set({ hasGenetics: true })
               .where(eq(adults.id, adultId));

        await db.batch([geneticsQuery, adultUpdateQuery]);

        return new Response(JSON.stringify({
            success: true,
            message: `Genetic dataset payload committed cleanly with streamlined formats for adult: ${adultId}.`
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('[API GENETICS ACTION TRANSACTION FAILED]:', error);
        return new Response(JSON.stringify({
            success: false,
            message: error.message || "An exception occurred inside the atomic transaction commit processing stream."
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
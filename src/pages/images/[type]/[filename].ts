// src/pages/images/[type]/[filename].ts
import type { APIRoute } from "astro";
import { env } from 'cloudflare:workers'

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
    const { type, filename } = params;

    if (!type || !filename) {
        return new Response("Missing parameters", { status: 400 });
    }

    try {
        // Get R2 Bucket
        // @ts-ignore
        const astroRuntime = globalThis[Symbol.for('astro.cloudflare.runtime')] || globalThis.__ASTRO_CLOUDFLARE_RUNTIME__;
        const bucket = env?.SUALBYRONETE_MEDIA || astroRuntime?.env?.SUALBYRONETE_MEDIA;

        if (!bucket) {
            return new Response("R2 Storage connection unlinked", { status: 500 });
        }

        // Get Object
        const r2ObjectKey = `images/${type}/${filename}`;
        const imageObject = await bucket.get(r2ObjectKey);

        if (!imageObject) {
            console.log(bucket);
            console.error(`[R2 GET Error] Object not found in bucket for key: "${filename}"`);
            return new Response("Image asset not found", { status: 404 });
        }

        const fileStream = imageObject.body;

        const ext = filename.split(".").pop()?.toLowerCase();
        const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

        return new Response(fileStream, {
            headers: {
                'content-type': contentType ,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (e: any) {
        return new Response(e.message || "Internal Delivery Error", { status: 500 });
    }
}
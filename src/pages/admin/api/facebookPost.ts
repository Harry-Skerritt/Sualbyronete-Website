// src/pages/api/facebookPost.ts
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface PuppyRequestBody {
    name: string;
    breed?: string;
    dogID: string;
    imageUrl: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const PAGE_ID = env?.FACEBOOK_PAGE_ID;
        const ACCESS_TOKEN = env?.FACEBOOK_PAGE_ACCESS_TOKEN;

        if (!PAGE_ID || !ACCESS_TOKEN) {
            return new Response(
                JSON.stringify({ error: "Server Configuration Error: Missing API keys in environment variables." }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const body = await request.json() as PuppyRequestBody;
        const { name, breed, dogID, imageUrl } = body;

        if (!name || !imageUrl) {
            return new Response(
                JSON.stringify({ error: "Validation Error: 'name' and 'imageUrl' fields are strictly required." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        await delay(3000);

        const websiteUrl = `https://sualbyronete.co.uk/puppies/${dogID}`;
        const postCaption = `✨ New Puppy Announcement! ✨\n\nMeet ${name}, a beautiful ${breed || 'puppy'} who just joined the family! \n\n🐾 Visit my website for full details! 👉 ${websiteUrl} 🐶`;

        const metaApiUrl = `https://graph.facebook.com/v20.0/${PAGE_ID}/photos`;

        console.log("👉 [Post Image URL]: ", imageUrl);

        const metaResponse = await fetch(metaApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                url: imageUrl,
                caption: postCaption,
                access_token: ACCESS_TOKEN
            })
        });

        const metaData = await metaResponse.json() as { id?: string; error?: any };

        console.log("👉 [META RESPONSE OBJECT]:", JSON.stringify(metaData));

        if (!metaResponse.ok || metaData.error) {
            return new Response(
                JSON.stringify({ error: "Meta API rejection", details: metaData.error?.message }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ success: true, postId: metaData.id }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (err: any) {
        return new Response(
            JSON.stringify({ error: "Internal Server Processing Failure", details: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
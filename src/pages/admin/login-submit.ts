// src/pages/admin/login-submit.ts
import type { APIRoute } from 'astro';
import { getDB } from '../../db';
import { adminUsers } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export const prerender = false;

// Password verifier - extracts salt and checks the sync hash
function verifyPassword(typedPassword: string, storedHashInDB: string): boolean {
    const parts = storedHashInDB.split(':');
    if (parts.length !== 2) return false;

    const [salt, originalHash] = parts;
    const checkHash = crypto.pbkdf2Sync(typedPassword, salt, 1000, 64, 'sha512').toString('hex');
    return originalHash === checkHash;
}

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const { username, password } = (await request.json()) as {
            username?: string;
            password?: string;
        };

        // Core Validation Check
        if (!username || !password) {
            return new Response(JSON.stringify({ success: false, message: "Missing fields" }), { status: 400 });
        }

        // Initialize Safe SQL Parameterized Query Engine
        const db = await getDB();

        const users = await db.select()
            .from(adminUsers)
            .where(eq(adminUsers.username, username.trim()))
            .limit(1);

        const user = users[0];

        // User Lookup Verification Guard
        if (!user || !user.isActive) {
            return new Response(JSON.stringify({ success: false, message: "Invalid username or password" }), { status: 401 });
        }

        // Cryptographic Password Comparison Guard
        const isPasswordValid = verifyPassword(password, user.passwordHash);
        if (!isPasswordValid) {
            return new Response(JSON.stringify({ success: false, message: "Invalid username or password" }), { status: 401 });
        }

        // Update last login timestamp in background
        try {
            await db.update(adminUsers)
                .set({ lastLogin: new Date().toISOString() })
                .where(eq(adminUsers.id, user.id));
        } catch (e) { /* background fail safe */ }

        // Set an HTTP-Only, Secure Cookie Gatekeeper
        cookies.set('admin_session', 'true', {
            path: '/',
            maxAge: 86400, // 24 hours
            secure: true,
            httpOnly: true, // Safeguards cookie data from window.document hacks
            sameSite: 'strict'
        });

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        console.error("Auth routing failure:", error);
        return new Response(JSON.stringify({ success: false, message: "Internal Server Error" }), { status: 500 });
    }
};
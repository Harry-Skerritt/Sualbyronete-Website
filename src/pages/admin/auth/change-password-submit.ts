// src/pages/admin/auth/change-password-submit.ts
import type { APIRoute } from 'astro';
import { getDB } from '../../../db';
import { adminUsers } from '../../../db/schema.ts';
import { eq, or } from 'drizzle-orm';
import crypto from 'crypto';

export const prerender = false;

function verifyPassword(typedPassword: string, storedHashInDB: string): boolean {
    const parts = storedHashInDB.split(':');
    if (parts.length !== 2) return false;
    const [salt, originalHash] = parts;
    const checkHash = crypto.pbkdf2Sync(typedPassword, salt, 1000, 64, 'sha512').toString('hex');
    return originalHash === checkHash;
}

function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const { identifier, currentPassword, newPassword, token } = (await request.json()) as {
            identifier?: string;
            currentPassword?: string;
            newPassword?: string;
            token?: string;
        };

        if (!identifier || !newPassword) {
            return new Response(JSON.stringify({ success: false, message: "All fields are required" }), { status: 400 });
        }

        const db = await getDB();
        const cleanIdentifier = identifier.trim().toLowerCase();

        // Find user
        const users = await db.select()
            .from(adminUsers)
            .where(
                or(
                    eq(adminUsers.username, cleanIdentifier),
                    eq(adminUsers.email, cleanIdentifier)
                )
            )
            .limit(1);

        const user = users[0];

        if (!user || !user.isActive) {
            return new Response(JSON.stringify({ success: false, message: "Account not found or inactive" }), { status: 404 });
        }

        if (token) {
            const isTokenValid = user.resetTokenHash === token && user.resetTokenExpires && user.resetTokenExpires > Date.now();

            if (!isTokenValid) {
                return new Response(JSON.stringify({
                    success: false, message: "Your password reset session link has expired or is invalid." }), { status: 403 });
            }
        } else {
            if (!currentPassword) {
                return new Response(JSON.stringify({ success: false, message: "Current password is required" }), { status: 400 });
            }

            // Cryptographic check of current credentials
            const isPasswordValid = verifyPassword(currentPassword, user.passwordHash);
            if (!isPasswordValid) {
                return new Response(JSON.stringify({ success: false, message: "Current password is incorrect" }), { status: 401 });
            }
        }

        // Encrypt new password and update record
        const newPasswordHash = hashPassword(newPassword);


        await db.update(adminUsers)
            .set({
                passwordHash: newPasswordHash,
                resetTokenHash: null,
                resetTokenExpires: null,
            })
            .where(eq(adminUsers.id, user.id));

        // Update the active session name cookie context to match the modified user profile
        cookies.set('admin_user_name', user.name, {
            path: '/',
            maxAge: 86400,
            secure: true,
            httpOnly: false,
            sameSite: 'strict'
        });

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        console.error("Change password route failure:", error);
        return new Response(JSON.stringify({ success: false, message: "Internal Server Error" }), { status: 500 });
    }
};
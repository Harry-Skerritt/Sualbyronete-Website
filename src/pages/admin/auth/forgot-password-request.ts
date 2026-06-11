// src/pages/admin/auth/forgot-password-request.ts
import type { APIRoute } from 'astro';
import { getDB } from "../../../db";
import { adminUsers } from "../../../db/schema.ts";
import { eq } from "drizzle-orm";
import { env } from 'cloudflare:workers';
import crypto from "crypto";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const { email } = (await request.json()) as { email?: string };

        if (!email || !email.includes('@')) {
            return new Response(JSON.stringify({ success: false, message: "A valid email is required" }), { status: 400 });
        }

        const RESEND_API_KEY = env?.RESEND_API_KEY;
        const DOMAIN_NAME = env.DOMAIN_NAME;

        if (!RESEND_API_KEY || !DOMAIN_NAME) {

        }

        const db = await getDB();
        const cleanEmail = email.trim().toLowerCase();

        const users = await db.select()
            .from(adminUsers)
            .where(eq(adminUsers.email, cleanEmail))
            .limit(1);

        const user = users[0];

        // Camo Layer
        if (!user || !user.isActive) {
            return new Response(JSON.stringify({ success: true, message: "Process completed successfully" }), { status: 200 });
        }

        const resetToken = crypto.randomUUID();
        const QUARTER_HOUR_IN_MS = 15 * 60 * 1000;
        const expiryTimestamp = Date.now() + QUARTER_HOUR_IN_MS;

        await db.update(adminUsers)
            .set({
                resetTokenHash: resetToken,
                resetTokenExpires: expiryTimestamp,
            })
            .where(eq(adminUsers.id, user.id));

        const resetLink = `https://sualbyronete.co.uk/admin/system/change-password?token=${resetToken}&from=email`;
        // Send Email

        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: `Sualbyronete <security@${DOMAIN_NAME}>`,
                to: [cleanEmail],
                subject: `🔒 Reset Your Admin Account Password`,
                html: `
                <div style="background-color: #f8fafc; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                        <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border-top: 6px solid #ef4444;">
        
                            <div style="padding: 40px 35px;">
                                <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">
                                    Password Reset Request
                                </h2>
            
                                <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
                                    A password reset request was initiated for your administrator dashboard account on <strong>${DOMAIN_NAME}</strong>. 
                                </p>

                                <div style="margin: 30px 0; text-align: center;">
                                    <a href="${resetLink}" style="background-color: #0f172a; color: #ffffff; padding: 12px 28px; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 6px; display: inline-block;">
                                        Reset My Password
                                    </a>
                                </div>
            
                                <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin-bottom: 0; background-color: #f8fafc; padding: 12px; border-radius: 6px; border: 1px dashed #e2e8f0;">
                                    ⚠️ <strong>Security Note:</strong> This secure access link will expire in exactly <strong>15 minutes</strong>. If you did not initiate this transaction yourself, please ignore this email; your current login credentials will remain entirely unchanged.
                                </p>
                            </div>
        
                             <div style="background-color: #f1f5f9; padding: 24px 35px; text-align: center; border-top: 1px solid #e2e8f0;">
                                    <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
                                        This is an automated email from <strong>${DOMAIN_NAME}</strong>.<br />
                                        Please do not reply directly to this email message.
                                    </p>
                                </div>
                        </div>
                    </div>
                `,
            }),
        });

        if (!resendResponse.ok) {
            const errorLog = await resendResponse.text();
            console.error("[Resend Recovery Email Delivery Collapse]", errorLog);
            return new Response(JSON.stringify({ success: false, message: "Email gateway rejected delivery step" }), { status: 502 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error("Forgot password API catastrophic failure:", error);
        return new Response(JSON.stringify({ success: false, message: "Internal server processing failure" }), { status: 500 });
    }
}
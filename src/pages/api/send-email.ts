// src/pags/api/send-email.ts
import type { APIRoute } from "astro";
import { env } from 'cloudflare:workers';

export const prerender = false;

export const POST: APIRoute = async (context) => {
    const { request } = context;
    const url = new URL(request.url);

    try {
        const formData = await request.formData();

        // Honeypot spam check
        if (formData.get('middle_name')) {
            console.warn("[Spam Blocked] Honeypot field triggered.");
            return new Response("Spam Detected", { status: 400 });
        }

        // Get ENVs
        const TURNSTILE_SECRET_KEY = env?.TURNSTILE_SECRET_KEY;
        const RESEND_API_KEY = env?.RESEND_API_KEY;
        const DOMAIN_NAME = env?.DOMAIN_NAME;
        const PERSONAL_EMAIL = env?.PERSONAL_EMAIL;

        if (!TURNSTILE_SECRET_KEY || !RESEND_API_KEY || !DOMAIN_NAME || !PERSONAL_EMAIL) {
            console.error("[Configuration Error] One or more binding environment variables are missing in this environment");
            return context.redirect(`${url.origin}/contact?error=server_error`, 303);
        }

        // Get Data
        const name = formData.get('name')?.toString().trim();
        const email = formData.get('email')?.toString().trim();
        const reference = formData.get('reference')?.toString().trim();
        const message = formData.get('message')?.toString().trim();
        const token = formData.get('cf-turnstile-response')?.toString().trim();
        const ip = request.headers.get('CF-Connecting-IP') || '';

        if (!name || !email || !message) {
            return Response.redirect(`${url.origin}/contact?error=missing_fields`, 303);
        }

        // Turnstile Verification
        let verifyFormData = new FormData();
        verifyFormData.append('secret', env.TURNSTILE_SECRET_KEY);
        verifyFormData.append('response', token || '');
        verifyFormData.append('remoteip', ip || ``);

        const turnstileResult = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            body: verifyFormData,
            method: 'POST',
        });

        const outcome = await turnstileResult.json() as { success: boolean; };
        if (!outcome.success) {
            console.error("[Verification Failed] Turnstile response challenge was rejected.");
            return Response.redirect(`${url.origin}/contact?error=captcha_failed`, 303);
        }

        // Send Email
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: `Sualbyronete Web <contact@${env.DOMAIN_NAME}>`,
                reply_to: email,
                to: [env.PERSONAL_EMAIL],
                subject: reference ? `🐾 Puppy Inquiry: ${reference}` : `New Message from ${name}`,
                text: `NEW INQUIRY\n\nName: ${name}\nEmail: ${email}\nReference: ${reference || 'General Inquiry'}\n\nMessage:\n${message}`,
                html: `
                    <div style="background-color: #f8fafc; padding: 30px 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                
                            <div style="background-color: #0f172a; padding: 20px 25px;">
                                <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600; letter-spacing: 0.5px;">
                                    🐾 NEW WEB INQUIRY RECEIPT
                                </h2>
                            </div>

                            <div style="padding: 25px;">
                    
                                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px; font-weight: 600; text-transform: uppercase;">From:</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-size: 16px; font-weight: 500;">${name}</td>
                                    </tr>
                                
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase;">Email:</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-size: 16px;">
                                            <a href="mailto:${email}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${email}</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase;">Regarding:</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-size: 16px;">
                                            <span style="background-color: #f1f5f9; color: #0f172a; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 14px;">
                                                ${reference || 'General Inquiry'}
                                            </span>
                                        </td>
                                    </tr>
                                </table>

                                <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
                                    <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                                        User Message:
                                    </h3>
                                    <div style="background-color: #fafafa; border-left: 4px solid #94a3b8; padding: 15px; color: #334155; font-size: 15px; line-height: 1.6; border-radius: 0 4px 4px 0; font-style: italic;">
                                        "${message.replace(/\n/g, '<br />')}"
                                    </div>
                                </div>

                                <div style="margin-top: 30px; text-align: center;">
                                    <a href="mailto:${email}?subject=Re: Puppy Inquiry: ${reference || 'General Inquiry'}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 6px; display: inline-block;">
                                        ✉️ Click to Reply Instantly
                                    </a>
                                </div>

                            </div>

                            <div style="background-color: #f8fafc; padding: 15px 25px; border-top: 1px solid #e2e8f0; text-align: center;">
                                <small style="color: #94a3b8; font-size: 11px;">
                                Sent automatically via backend runtime route routing on ${DOMAIN_NAME}
                                </small>
                            </div>
                        </div>
                    </div>
                `}),
        });

        // Send auto-reply to custmomer
        if (res.ok) {
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: `Susan Francis <no-reply@${env.DOMAIN_NAME}>`,
                    to: [email],
                    subject: `Thank for reaching out, ${name}!`,
                    html: `
                        <div style="background-color: #f8fafc; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                            <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border-top: 6px solid #1e293b;">
            
                                <div style="padding: 40px 35px;">
                                    <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 20px;">
                                        Hi ${name},
                                    </h2>
                
                                    <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
                                        Thanks for reaching out! I've successfully received your message regarding your inquiry for: 
                                        <span style="background-color: #f1f5f9; color: #0f172a; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 15px;">
                                            ${reference || 'General Inquiry'}
                                        </span>
                                    </p>
                
                                    <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                                        I'm looking forward to reading your message and will get back to you with all the details as soon as I possibly can!
                                    </p>
                
                                    <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; margin-top: 32px;">
                                        <p style="color: #64748b; font-size: 14px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                                        Best regards,
                                        </p>
                                        <p style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 0;">
                                            Susan Francis
                                        </p>
                                    </div>
                                </div>
            
                                <div style="background-color: #f1f5f9; padding: 24px 35px; text-align: center; border-top: 1px solid #e2e8f0;">
                                    <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
                                        This is an automated confirmation from <strong>${DOMAIN_NAME}</strong>.<br />
                                        Please do not reply directly to this email message.
                                    </p>
                                </div>
                            </div>
                        </div>
                    `,
                }),
            });

            // Return to success page + flag
            return Response.redirect(`${url.origin}/contact?success=true`, 303);
        } else {
            const errorLog = await res.text();
            console.error("[Resend Delivery Crash]", errorLog);
            return Response.redirect(`${url.origin}/contact?error=email_failed`, 303);
        }
    } catch (err: any) {
        console.error("Critical Worker Error:", err.message);
        return Response.redirect(`${url.origin}/contact?error=server_error`, 303);
    }
}
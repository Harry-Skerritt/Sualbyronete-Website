// functions/send-email.ts

interface Env {
    TURNSTILE_SECRET_KEY: string;
    RESEND_API_KEY: string;
    DOMAIN_NAME: string;
    PERSONAL_EMAIL: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);

    try {
        const formData = await request.formData();

        // Honeypot spam check
        if (formData.get('honeypot')) {
            return new Response("Spam Detected", { status: 400})
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
                text: `From: ${name} (${email})\nDog Reference: ${reference || 'None'}\n\nMessage:\n${message}`,
            }),
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
                        <div style="font-family: sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: 0 auto;">
                            <h2>Hi ${name},</h2>
                            <p>Thanks for getting in touch with me. I have received your message regarding: <strong>${reference || 'General Inquiry'}</strong>.</p>
                            <p>I will review your message and get back to you as soon as I can!</p>
                            <p>Best regards,<br /><strong>Susan Francis</strong></p>
                            <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
                            <small style="color: #888;">This is an automated confirmation from Sualbyronete. Please do not reply directly to this email.</small>
                        </div> 
                    `,
                }),
            });

            // Return to success page + flag
            const url = new URL(request.url);
            return Response.redirect(`${url.origin}/contact?success=true`, 303);
        } else {
            return Response.redirect(`${url.origin}/contact?error=email_failed`, 303);
        }
    } catch (err: any) {
        console.error("Critical Worker Error:", err.message);
        return Response.redirect(`${url.origin}/contact?error=server_error`, 303);
    }
}
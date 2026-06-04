// src/scripts/admin/login-submit.ts

const form = document.getElementById('login-form');
const errorBanner = document.getElementById('error-banner');
const errorText = document.getElementById('error-text');

/* Login */
form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = (document.getElementById('uname') as HTMLInputElement).value;
    const password = (document.getElementById('psw') as HTMLInputElement).value;

    if (errorBanner) errorBanner.style.display = 'none';

    try {
        // Send to DB
        const response = await fetch ('/admin/login-submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = (await response.json()) as { success: boolean; message?: string };

        if (response.ok && data.success) {
            window.location.href = "/admin/dashboard";
        } else {
            throw new Error(data.message || "Invalid Credentials");
        }
    } catch (err: any) {
        if (errorBanner && errorText) {
            errorText.textContent = err.message;
            errorBanner.style.display = 'block';
        }
    }
});
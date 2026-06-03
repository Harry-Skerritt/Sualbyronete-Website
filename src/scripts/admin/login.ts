// src/scripts/admin/login.ts

const form = document.getElementById('login-form');
const errorBanner = document.getElementById('error-banner');
const errorText = document.getElementById('error-text');

/* Login */
form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = (document.getElementById('uname') as HTMLInputElement).value;
    const password = (document.getElementById('psw') as HTMLInputElement).value;

    if (username === "admin" && password === "SuperSecretPassword123") {
        // Set session gatekeeper cookie
        document.cookie = "admin_session=true; path=/; max-age=86400; SameSite=Strict";
        window.location.href = "/admin/dashboard";
    } else {
        if (errorBanner && errorText) {
            errorText.textContent = "Invalid username or password";
            errorBanner.style.display = "block";
        }
    }
});
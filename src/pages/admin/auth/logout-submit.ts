// src/pages/admin/auth/logout-submit.ts
import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
    cookies.delete('admin_session', { path: '/' });
    cookies.delete('admin_user_name', { path: '/' });
    return new Response(JSON.stringify({ success: true, redirect: '/' }), { status: 200 });
};
// src/middleware.ts
import { defineMiddleware } from "astro/middleware";

export const onRequest = defineMiddleware(async (context, next) => {
    const url = new URL(context.request.url);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();

    const isImageRequest =
        pathname.includes('/images/') ||
        pathname.endsWith('.jpg') ||
        pathname.endsWith('.jpeg') ||
        pathname.endsWith('.png') ||
        pathname.endsWith('.webp');

    if (isImageRequest) {
        return next();
    }

    const isHandlingAdminHost =
        hostname.startsWith("admin.");

    if (isHandlingAdminHost) {
        const searchParamsString = url.search;

        if (url.pathname === "/") {
            return context.rewrite(`/admin${searchParamsString}`);
        }
        if (!url.pathname.startsWith("/admin")) {
            return context.rewrite(`/admin${url.pathname}${searchParamsString}`);
        }
    }

    if (!isHandlingAdminHost && url.pathname.startsWith("/admin")) {
        //return context.redirect("/404");
    }

    const isAdminRoute = url.pathname.startsWith("/admin");
    const isLoginEndpoint =
        url.pathname === "/admin" ||
        url.pathname === "/admin/" ||
        url.pathname === "/admin/auth/login-submit" ||
        url.pathname === "/admin/auth/change-password-submit" ||
        url.pathname === "/admin/puppy/add-submit" ||
        url.pathname === "/admin/adult/add-submit";

    if (isAdminRoute && !isLoginEndpoint) {
        const sessionCookie = context.cookies.get('admin_session');

        // No cookie - kick them right back to the root of the admin directory
        if (!sessionCookie || sessionCookie.value !== 'true') {
            return context.redirect("/admin");
        }
    }

    return next();
});
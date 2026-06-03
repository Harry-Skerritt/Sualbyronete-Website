// src/middleware.ts
import { defineMiddleware } from "astro/middleware";

export const onRequest = defineMiddleware(async (context, next) => {
    const url = new URL(context.request.url);
    const hostname = url.hostname;

    // Handle production subdomains on Cloudflare
    if (hostname.startsWith("admin.")) {
        if (url.pathname === "/") {
            return context.rewrite("/admin");
        }
        if (!url.pathname.startsWith("/admin")) {
            return context.rewrite(`/admin${url.pathname}`);
        }
    }

    // Prevent regular users from manually typing domain.com/admin
    if (!hostname.startsWith("admin.") && url.pathname.startsWith("/admin") && process.env.NODE_ENV === "production") {
        return context.redirect("/404");
    }

    // Proceed as normal for all other main site routes
    return next();
});
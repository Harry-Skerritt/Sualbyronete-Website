// @ts-check
import { defineConfig } from 'astro/config';
import path from 'path';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
    trailingSlash: 'never',
    output: 'server',
    adapter: cloudflare({
        imageService: 'passthrough',
        configPath: './wrangler.jsonc',
        remoteBindings: true,
    }),
    base: '',
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@use "${path.resolve('./src/styles/variables')}" as *;`
                }
            }
        },
    },
});
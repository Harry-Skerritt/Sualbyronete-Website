// @ts-check
import { defineConfig } from 'astro/config';
import path from 'path';
import cloudflare from '@astrojs/cloudflare';

const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('dev');

// https://astro.build/config
export default defineConfig({
    trailingSlash: 'never',
    output: 'server',
    adapter: cloudflare({
        imageService: 'passthrough'
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
// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import path from 'path';

import cloudflare from '@astrojs/cloudflare';
import node from '@astrojs/node';

const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('dev');

// https://astro.build/config
export default defineConfig({
    trailingSlash: 'never',
    output: 'server',
    adapter: isDev ? node({ mode: 'standalone' }) : cloudflare(),
    integrations: [
        icon()
    ],
    base: '',
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@use "${path.resolve('./src/styles/variables')}" as *;`
                }
            }
        },
        ssr: {
            noExternal: isDev ? ['astro-icon'] : []
        }
    },
});
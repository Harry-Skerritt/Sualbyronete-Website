// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import path from 'path';

// GitHub stuff
const isProduction = process.env.NODE_ENV === 'production';

// https://astro.build/config
export default defineConfig({
    integrations: [
        icon()
    ],

    // GitHub Stuff - Remove before final build
    site: 'https://harry-skerritt.github.io',
    base: isProduction ? '/Sualbyronete-Website' : '',

    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@use "${path.resolve('./src/styles/variables')}" as *;`
                }
            }
        }
    }
});

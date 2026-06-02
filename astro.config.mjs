// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

// GitHub stuff
const isProduction = import.meta.env.PROD;

// https://astro.build/config
export default defineConfig({
    integrations: [
        icon()
    ],

    // GitHub Stuff - Remove before final build
    site: 'https://harry-skerritt.github.io',
    base: isProduction ? '/Sualbyronete-Website' : '/'
});

// @ts-check
import { defineConfig } from 'astro/config';
import path from 'path';
import cloudflare from '@astrojs/cloudflare';

import sitemap from '@astrojs/sitemap';
import securityTxt from "astro-securitytxt";

// https://astro.build/config
export default defineConfig({
  site: 'https://sualbyronete.co.uk',
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

  integrations: [
      sitemap(),
      securityTxt({
          contact: "mailto:security@sualbyronete.com",
          expires: "2027-06-30T00:00:00.000Z",
          placement: "both"
      }),
  ],
});
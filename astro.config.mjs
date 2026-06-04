import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://obinnadc.github.io',
  base: '/wedeploy',
  integrations: [tailwind()],
});

import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

const githubOwner = process.env.GITHUB_REPOSITORY_OWNER?.toLowerCase();
const site = githubOwner ? `https://${githubOwner}.github.io` : 'https://obinnadc.github.io';

export default defineConfig({
  site,
  base: '/wedeploy',
  integrations: [tailwind(), react()],
});

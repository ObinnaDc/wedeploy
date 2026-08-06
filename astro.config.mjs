import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

const githubOwner = process.env.GITHUB_REPOSITORY_OWNER?.toLowerCase();
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY?.toLowerCase().endsWith('/wedeploy');
const site =
  process.env.SITE_URL ??
  process.env.PUBLIC_SITE_URL ??
  process.env.RAILWAY_STATIC_URL ??
  (githubOwner ? `https://${githubOwner}.github.io` : 'https://obinnadc.github.io');
const base = process.env.SITE_BASE ?? process.env.PUBLIC_SITE_BASE ?? (isGitHubPagesBuild ? '/wedeploy' : '/');

export default defineConfig({
  site,
  base,
  integrations: [tailwind(), react()],
});

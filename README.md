# Deploy Studio Astro Rebuild

Production-ready Astro + Tailwind rebuild of `https://wedeploy.studio`.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Structure

- `src/pages/index.astro` composes the homepage.
- `src/components/` contains the reusable UI sections.
- `public/assets/` contains local visual assets extracted from the source site.
- `scraped-site/` contains the original scrape output used as migration reference.

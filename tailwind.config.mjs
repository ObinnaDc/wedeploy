/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        deploy: {
          blue: '#0877e8',
          navy: '#070817',
          ink: '#030712',
          muted: '#4b5563',
          line: '#e8edf4',
          soft: '#f7f8fa',
          pro: '#d3e4ff',
        },
      },
      boxShadow: {
        soft: '0 18px 50px rgba(17, 24, 39, 0.04)',
      },
    },
  },
  plugins: [],
};

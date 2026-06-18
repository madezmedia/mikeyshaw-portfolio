import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'hybrid',
  adapter: vercel({
    runtime: 'nodejs20.x'
  }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
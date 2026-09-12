import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import clerk from '@clerk/astro';

// https://astro.build/config
export default defineConfig({
  server: { host: true },
  integrations: [clerk(), react(), tailwind()]
});

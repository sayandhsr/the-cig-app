import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

import clerk from '@clerk/astro';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind(), clerk()]
});

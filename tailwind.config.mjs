/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        background: '#0c0c0c',
        surface: '#181818',
        'vintage-red': '#bd2620', // From Djarum Black
        'vintage-paper': '#dfcdb4', // From Djarum Black
        'vintage-charcoal': '#1a1a1a',
        cream: '#f4efe6',
        gold: {
          light: '#e04239',
          DEFAULT: '#bd2620', // Overriding gold with red to minimize refactor
          dark: '#8b1814'
        },
        muted: '#8c8c8c'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Anton', 'sans-serif'], // Very bold and condensed display font
        serif: ['Rye', 'serif'] // Vintage western/poster feel
      },
      backgroundImage: {
        'grunge': "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
        'hero-gradient': 'linear-gradient(to top, #0c0c0c 10%, transparent 100%)',
      }
    },
  },
  plugins: [],
}

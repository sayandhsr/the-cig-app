/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a', // Dark charcoal/black
        surface: '#141414',
        tobacco: {
          light: '#8B5A2B',
          DEFAULT: '#5C3A21', // Deep brown
          dark: '#3E2723'
        },
        gold: {
          light: '#F3E5AB',
          DEFAULT: '#D4AF37', // Warm gold
          dark: '#AA8C2C'
        },
        cream: '#F8F5F2', // Cream/off-white typography
        muted: '#8c8c8c'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'], // For premium editorial feel
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.15), rgba(10, 10, 10, 1))',
      }
    },
  },
  plugins: [],
}

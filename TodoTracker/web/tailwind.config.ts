import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C3AED',
          foreground: '#EDE9FE',
        },
        surface: '#0B1220',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Helvetica', 'Apple Color Emoji'],
      },
    },
  },
  plugins: [],
} satisfies Config
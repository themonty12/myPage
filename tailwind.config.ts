import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#faf7f2',
          100: '#f3ede2',
          200: '#e8dbc7',
          300: '#d7c2a2',
          400: '#c3a47c',
          500: '#ae8759',
          600: '#946b41',
          700: '#775235',
          800: '#5f422d',
          900: '#4e3727',
        },
      },
    },
  },
  plugins: [],
}

export default config

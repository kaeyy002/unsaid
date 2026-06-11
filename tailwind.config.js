/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F172A',
        surface: '#1E293B',
        surface2: '#263347',
        purple: '#6D28D9',
        'purple-light': '#8B5CF6',
        cyan: '#22D3EE',
        muted: '#94A3B8',
        'text-main': '#F1F5F9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

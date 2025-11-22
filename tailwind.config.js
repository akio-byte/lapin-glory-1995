/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: '#FF00FF',
        coal: '#0f1118',
        asphalt: '#1b1f2d',
        glitch: '#7C8CDE',
      },
      fontFamily: {
        mono: [
          '"DM Mono"',
          '"VT323"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      boxShadow: {
        neon: '0 0 0 2px #FF00FF, 0 0 30px #FF00FF',
      },
      backgroundImage: {
        grid: 'linear-gradient(#22232e 1px, transparent 1px), linear-gradient(90deg, #22232e 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}

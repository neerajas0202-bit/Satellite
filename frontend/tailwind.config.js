/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#06090e',
          900: '#0a0f18',
          850: '#0f1726',
          800: '#152033',
          750: '#1b2a43',
          700: '#233656',
          600: '#344c77',
        },
        radar: {
          cyan: '#00f0ff',
          green: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          purple: '#a855f7'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}

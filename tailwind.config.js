/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F9F5F0',
        sand: '#ECE5DD',
        linen: '#F3EDE5',
        'warm-orange': '#F28B66',
        'deep-orange': '#FF6B35',
        'soft-peach': '#F9C5B0',
        'peach-tint': 'rgba(242,139,102,0.08)',
        'deep-gray': '#333333',
        'mid-gray': '#555555',
        'soft-gray': '#888888',
        'faint-gray': '#B8B8B8',
        sage: '#A8B5A3',
        'dusty-rose': '#D4A89C',
        amber: '#E8C896',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        'card': '20px',
        'btn': '24px',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'surface': '#f4faff',
        'surface-container-low': '#e6f6ff',
        'surface-container-lowest': '#ffffff',
        'on-surface': '#001f2a',
        
        // Semantic (Semaphore)
        'primary': '#00488d',
        'primary-container': '#005fbc', // Slightly lighter for gradient
        'secondary': '#1b6d24',
        'tertiary': '#960010',
        'tertiary-container': '#bc1c21',
        'on-secondary-fixed-variant': '#005312',
        
        // Yellow/Amber alert
        'primary-fixed': '#ffb300', // Alert yellow
        
        // Neutral/Pending
        'outline-variant': '#c6c6c6',
        'surface-container-high': '#e3e3e3',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Body default
        display: ['Manrope', 'sans-serif'], // Headings
      },
      borderRadius: {
        'xl': '0.75rem',
      }
    },
  },
  plugins: [],
}

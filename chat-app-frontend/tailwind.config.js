/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        screens: {
          'xsm': '530px',
          'xxs': '375px',
        }
      
    },
  },
  plugins: [],
}


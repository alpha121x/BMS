/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",   // Include HTML files in the content paths
    "./src/**/*.{js,jsx,ts,tsx}", 
    './components/**/*.{ts,tsx}', // Include all JavaScript, TypeScript, and React files in the src folder
  ],
  theme: {
    extend: {
      colors: {
        lightgreen: '#90ee90', // Use your desired shade of light green
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'teal-green': '#258094',
          'layout-gray': '#F1F3F4',
          'table-header': '#E2E8F0',
          'table-row-border-color': '#A0AEC0',
          'form-highlight': '#48B9D1'
        }
      },
    },
    plugins: [],
  };
  
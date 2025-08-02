/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./public/**/*.{html,js}",
    "./src/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
        'mono': ['SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace']
      }
    },
  },
  plugins: [],
}
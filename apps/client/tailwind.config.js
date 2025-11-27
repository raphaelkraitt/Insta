/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#E1306C', // Instagram Pink
                secondary: '#405DE6', // Instagram Blue
                dark: '#121212',
                light: '#FAFAFA'
            }
        },
    },
    plugins: [],
}

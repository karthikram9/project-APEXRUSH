/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                darkBg: "#121212",
                cardBg: "rgba(30, 30, 30, 0.7)",
            }
        },
    },
    plugins: [],
}

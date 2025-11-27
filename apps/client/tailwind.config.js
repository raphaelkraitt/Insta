/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366f1',
                    dark: '#4f46e5',
                    light: '#818cf8',
                },
                secondary: {
                    DEFAULT: '#ec4899',
                    dark: '#db2777',
                    light: '#f472b6',
                },
                accent: {
                    DEFAULT: '#f59e0b',
                    dark: '#d97706',
                    light: '#fbbf24',
                },
                success: {
                    DEFAULT: '#10b981',
                    dark: '#059669',
                    light: '#34d399',
                },
                game: {
                    bg: {
                        main: '#0f172a',
                        secondary: '#1e293b',
                        card: '#334155',
                        hover: '#475569',
                    },
                    text: {
                        primary: '#f1f5f9',
                        secondary: '#cbd5e1',
                        muted: '#94a3b8',
                    },
                    border: {
                        DEFAULT: '#475569',
                        light: '#64748b',
                    }
                }
            },
            fontFamily: {
                game: ['Fredoka', 'sans-serif'],
                tech: ['Space Grotesk', 'sans-serif'],
            },
            borderRadius: {
                'game': '16px',
            },
            boxShadow: {
                'neon': '0 0 10px rgba(99, 102, 241, 0.3), 0 0 20px rgba(236, 72, 153, 0.2)',
                'neon-strong': '0 0 20px rgba(99, 102, 241, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)',
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' },
                    '50%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.8)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
            },
        },
    },
    plugins: [],
}

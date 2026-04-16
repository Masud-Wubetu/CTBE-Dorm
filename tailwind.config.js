/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
        secondary: '#10b981',
        accent: '#6366f1',
        surface: 'rgba(255,255,255,0.03)',
        'surface-hover': 'rgba(255,255,255,0.07)',
      },
      backgroundImage: {
        'glow-blue': 'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15), transparent 40%)',
        'glow-purple': 'radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.15), transparent 40%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-delay': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards',
        'fade-in-delay-2': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Macchiato Theme Colors
        macchiato: {
          base: '#24273a',      // Base background
          mantle: '#1e2030',    // Mantle background
          crust: '#181926',     // Crust background
          text: '#cad3f5',      // Text color
          subtext: '#a5adcb',   // Subtext color
          surface: '#363a4f',   // Surface color
          overlay: '#494d64',   // Overlay color
          blue: '#8aadf4',      // Blue accent
          lavender: '#b7bdf8',  // Lavender accent
          peach: '#f5a97f',     // Peach accent
          green: '#a6da95',     // Green accent
          red: '#ed8796',       // Red accent
          yellow: '#eed49f',    // Yellow accent
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
}

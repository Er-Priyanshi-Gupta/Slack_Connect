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
          DEFAULT: '#4A154B',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#611f69',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F8F9FA',
          foreground: '#6C757D',
        },
        accent: {
          DEFAULT: '#007A5A',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#DC3545',
          foreground: '#FFFFFF',
        },
        border: '#DEE2E6',
        input: '#DEE2E6',
        ring: '#4A154B',
        background: '#FFFFFF',
        foreground: '#212529',
      },
    },
  },
  plugins: [],
}

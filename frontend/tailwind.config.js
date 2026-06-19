/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#FAF5EB',
          subtle: '#F5EFE0',
          surface: '#FFFFFF',
          elevated: '#EEE8D8',
        },
        border: {
          DEFAULT: '#E2D9CC',
          hover: '#C8BDAF',
          focus: '#29ABE2',
        },
        primary: {
          DEFAULT: '#29ABE2',
          hover: '#1E96CE',
          light: '#1E96CE',
          glow: 'rgba(41, 171, 226, 0.2)',
        },
        accent: {
          DEFAULT: '#F15A29',
          hover: '#D94A1C',
          green: '#3DAD8D',
          yellow: '#F7B731',
          cyan: '#4CBFCB',
          glow: 'rgba(241, 90, 41, 0.15)',
        },
        text: {
          primary: '#1A1A2E',
          secondary: '#3D3D5C',
          tertiary: '#7070A0',
          muted: '#A0A0C0',
        },
        success: '#3DAD8D',
        warning: '#F7B731',
        error: '#E53E3E',
        info: '#29ABE2',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['Menlo', 'Monaco', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'float': 'float 7s ease-in-out infinite',
        'float-alt': 'floatAlt 9s ease-in-out infinite',
        'float-slow': 'float 11s ease-in-out 1s infinite',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'wave-hand': 'waveHand 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-22px) rotate(6deg)' },
          '66%': { transform: 'translateY(-10px) rotate(-4deg)' },
        },
        floatAlt: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(18px) rotate(-5deg)' },
          '66%': { transform: 'translateY(8px) rotate(3deg)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.06)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        waveHand: {
          '0%, 100%': { transform: 'rotate(-10deg)' },
          '50%': { transform: 'rotate(10deg)' },
        },
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
};

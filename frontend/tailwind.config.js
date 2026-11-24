/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#080C14',
          surface: '#0F172A',
          card: '#131D31',
          elevated: '#1E293B',
          border: '#1E293B',
          borderLight: '#334155',
        },
        fintech: {
          emerald: '#00D09C',
          emeraldHover: '#00B386',
          emeraldGlow: 'rgba(0, 208, 156, 0.15)',
          red: '#EF4444',
          redHover: '#DC2626',
          redGlow: 'rgba(239, 68, 68, 0.15)',
          blue: '#387ED1',
          cyan: '#06B6D4',
          amber: '#F59E0B',
          purple: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-emerald': '0 0 20px -3px rgba(0, 208, 156, 0.25)',
        'glow-red': '0 0 20px -3px rgba(239, 68, 68, 0.25)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.4)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        }
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        pulseGlow: 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

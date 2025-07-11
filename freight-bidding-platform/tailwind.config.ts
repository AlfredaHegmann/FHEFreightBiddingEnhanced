import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        dark: {
          bg: '#070910',
          panel: 'rgba(16, 20, 36, 0.92)',
          'panel-alt': 'rgba(18, 22, 38, 0.85)',
          border: 'rgba(120, 142, 182, 0.22)',
          'border-strong': 'rgba(148, 163, 184, 0.36)',
          text: '#f5f7ff',
          'text-secondary': 'rgba(198, 207, 232, 0.72)',
        },
        // Accent colors
        accent: {
          DEFAULT: '#6d6eff',
          light: '#8a8bff',
          dark: '#5456ff',
          soft: 'rgba(109, 110, 255, 0.16)',
        },
        // Success colors
        success: {
          DEFAULT: '#2bc37b',
          dark: '#199964',
          soft: 'rgba(43, 195, 123, 0.16)',
        },
        // Warning colors
        warning: {
          DEFAULT: '#f3b13b',
          dark: '#d89a2b',
          soft: 'rgba(243, 177, 59, 0.16)',
        },
        // Error colors
        error: {
          DEFAULT: '#ef5350',
          dark: '#dc2626',
          soft: 'rgba(239, 83, 80, 0.16)',
        },
        // Info colors
        info: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          soft: 'rgba(59, 130, 246, 0.16)',
        },
      },
      borderRadius: {
        'sm': '0.5rem',     // 8px
        'md': '1.05rem',    // 17px
        'lg': '1.35rem',    // 22px
        'xl': '1.75rem',    // 28px
        'full': '999px',    // pill shape
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '18px',
      },
      boxShadow: {
        'glass': '0 18px 42px -32px rgba(5, 8, 18, 0.9)',
        'glow': '0 0 20px rgba(109, 110, 255, 0.3)',
        'glow-strong': '0 0 30px rgba(109, 110, 255, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['DM Mono', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config

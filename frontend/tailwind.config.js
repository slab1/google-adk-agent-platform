/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base Palette (Deep Dark Mode)
        background: {
          DEFAULT: '#050505', // Deepest matte black - OLED optimized
          surface: '#121212', // Distinguishable layer
          card: '#1A1A1A', // Interactive layer
          border: '#333333', // Subtle definition
        },
        
        // Primary Brand (AI & Action)
        primary: {
          500: '#3B82F6', // Electric Blue - Main action, active borders
        },
        accent: {
          500: '#8B5CF6', // Agent Purple - MiniMax-M2 AI processing states
        },
        
        // Neutral / Typography
        text: {
          high: '#EDEDED', // Main content - Contrast 15.9:1 on Bg
          medium: '#A1A1AA', // Labels, secondary info - Contrast 7.3:1
          disabled: '#52525B',
        },
        
        // Semantic (System Status)
        success: '#10B981', // Green - Online/Ready
        warning: '#F59E0B', // Amber - Latency/High Load
        error: '#EF4444',   // Red - Offline/Failed
        
        // Surface Depth Strategy
        surface: {
          0: '#050505', // App Canvas
          1: '#121212', // Panels + 1px border #333333
          2: '#262626', // Hovered items/Dropdowns
        }
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      
      fontSize: {
        'display': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'heading': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'subheading': ['18px', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
        'code': ['13px', { lineHeight: '1.6', fontWeight: '400' }],
      },
      
      spacing: {
        '1': '4px',   // Base grid
        '2': '8px',   // Compact (Toolbar)
        '3': '12px',  // Standard (Card/Input)
        '6': '24px',  // Relaxed (Section)
        '16': '64px', // Sidebar expanded
        '20': '80px', // Sidebar compact
      },
      
      borderRadius: {
        'sharp': '4px',  // Buttons, Inputs, Tags
        'mild': '8px',   // Cards, Modals, Panels
      },
      
      animation: {
        'pulse-border': 'pulse-border 1.5s infinite ease-in-out',
        'typing': 'typing 1s infinite',
        'glow': 'glow 2s infinite',
      },
      
      keyframes: {
        'pulse-border': {
          '0%, 100%': { borderColor: '#333333' },
          '50%': { borderColor: '#8B5CF6' },
        },
        'typing': {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
      },
      
      boxShadow: {
        'glow': '0 0 0 2px rgba(59, 130, 246, 0.2)',
        'glow-accent': '0 0 0 2px rgba(139, 92, 246, 0.2)',
      }
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.text-numeric': {
          'font-variant-numeric': 'tabular-nums',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    }
  ],
}
import type { Config } from 'tailwindcss'
export default {
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {400:'#38bdf8',500:'#0ea5ff',600:'#0284c7',700:'#0369a1'},
        lime: {500:'#22c55e',600:'#16a34a'},
        flame: {500:'#fb923c',600:'#f97316'},
        cherry: {500:'#ef4444',600:'#dc2626'},
        gold: {500:'#fbbf24',600:'#d97706'},
        silver: {500:'#9ca3af',600:'#6b7280'},
      },
      boxShadow:{glass:'0 12px 34px rgba(0,0,0,0.35)',glow:'0 0 0 3px rgba(14,165,255,0.3)'},
      backdropBlur:{xs:'2px'},
      keyframes:{ blink:{'0%,100%':{opacity:1},'50%':{opacity:.4}} },
      animation:{'blink':'blink 1.2s ease-in-out infinite','pulse-slow':'pulse 3s ease-in-out infinite'}
    }
  },
  plugins: [],
} satisfies Config

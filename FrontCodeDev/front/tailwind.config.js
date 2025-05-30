/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        progress: 'progress 1.8s ease-in-out infinite',
        typing: 'typing 3.5s steps(30, end) infinite, blink 0.75s step-end infinite',
        pulse: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        progress: {
          '0%': { width: '0%', left: '0' },
          '50%': { width: '100%', left: '0' },
          '100%': { width: '0%', left: '100%' }
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' }
        },
        blink: {
          'from, to': { 'border-color': 'transparent' },
          '50%': { 'border-color': 'rgb(37, 99, 235)' }
        },
        pulse: {
          '0%, 100%': { opacity: 0.7 },
          '50%': { opacity: 0.3 }
        }
      }
    }
  }
}
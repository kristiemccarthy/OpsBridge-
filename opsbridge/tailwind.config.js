/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Noto Sans SC renders Simplified Chinese beautifully
        sans: ['Noto Sans SC', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Factory-appropriate palette — high contrast, visible in variable lighting
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        status: {
          pending:     '#6b7280', // grey
          in_progress: '#3b82f6', // blue
          completed:   '#22c55e', // green
          overdue:     '#ef4444', // red
        },
        priority: {
          low:    '#9ca3af',
          medium: '#f59e0b',
          high:   '#ef4444',
        },
      },
    },
  },
  plugins: [],
}

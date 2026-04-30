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
        radio: {
          bg: '#0a0a0a',
          surface: '#111111',
          border: '#1e1e1e',
          purple: '#7B68EE',
          blue: '#4169E1',
          violet: '#9370DB',
          text: '#e0e0e0',
          muted: '#666666',
          green: '#00ff88',
        },
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config

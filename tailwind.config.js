module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          light: '#f5f1e4',
          DEFAULT: '#efe8d7',
          dark: '#e5dbc1',
        },
        wood: {
          light: '#9e7e5c',
          DEFAULT: '#7d5f45',
          dark: '#5a4331',
        },
        brass: {
          light: '#ddc279',
          DEFAULT: '#c4a55f',
          dark: '#a58743',
        },
        ink: {
          light: '#394759',
          DEFAULT: '#2a3544',
          dark: '#1c2431',
        },
        libraryGreen: {
          light: '#3a6b46',
          DEFAULT: '#2a5234',
          dark: '#1e3d26',
        },
        warpcast: {
          light: '#9d7dea',
          DEFAULT: '#8252e4',
          dark: '#6836cc',
        },
        amber: {
          '50': '#fffbeb',
          '100': '#fef3c7',
          '200': '#fde68a',
          '800': '#92400e',
        },
        purple: {
          '50': '#faf5ff',
          '100': '#f3e8ff',
          '200': '#e9d5ff',
          '400': '#c084fc',
          '600': '#9333ea',
          '700': '#7e22ce',
        },
      },
      fontFamily: {
        serif: ['Bookman Old Style', 'Bookman', 'Palatino', 'Georgia', 'serif'],
        mono: ['Courier New', 'Courier', 'monospace'],
      },
      backgroundImage: {
        'wood-grain': "url('/textures/wood-grain.jpg')",
        'parchment-texture': "url('/textures/parchment.jpg')",
        'stamp-overlay': "url('/textures/stamp-texture.svg')",
        'card-texture': "url('/textures/index-card.png')",
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0, 0, 0, 0.1), 0 0 6px rgba(90, 67, 49, 0.1)',
        'card-hover': '0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 10px rgba(90, 67, 49, 0.15)',
        'drawer': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(90, 67, 49, 0.06)',
      },
    },
  },
  safelist: [
    'bg-parchment-texture',
    'bg-wood-texture',
    'bg-index-card',
    'text-warpcast',
    'text-ink-dark',
    'text-parchment-light',
    'text-brass-dark',
    'font-serif',
    'animate-text-in'
  ],
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}
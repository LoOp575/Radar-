import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        radar: {
          bg: '#061014',
          panel: '#0b1b22',
          soft: '#102a33',
          green: '#48f0a4',
          cyan: '#35d6ff',
          amber: '#ffcc66',
          red: '#ff6b6b'
        }
      }
    }
  },
  plugins: []
};

export default config;

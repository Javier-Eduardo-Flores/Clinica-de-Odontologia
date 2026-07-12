import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clinica: {
          dark: '#0C2B4E',
          medium: '#1A3D64',
          accent: '#1D546C',
          light: '#F4F4F4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], 
      },
    },
  },
  plugins: [],
};
export default config;
import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Brand = Vibrant Junction (teal primary, blue/indigo secondary)
        primary:   { DEFAULT:'#0bb8a6', dark:'#089b8c', light:'#3bd6c6' },
        secondary: { DEFAULT:'#1390e0', dark:'#0d6fb0', light:'#5b6cff' },
        ink:       '#0d1b2a',
        coral:     '#ff5a5f',
        amber:     { DEFAULT:'#ffb020', dark:'#e0890b' },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Poppins', 'sans-serif'],
        body:    ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      borderRadius: { card:'16px', lg:'22px', btn:'12px', pill:'999px' },
      boxShadow: {
        card:'0 2px 8px rgba(13,27,42,0.06)',
        'card-hover':'0 10px 30px rgba(13,27,42,0.12)',
      },
      backgroundImage: {
        brand: 'linear-gradient(120deg,#0bb8a6 0%,#1390e0 55%,#5b6cff 100%)',
      },
    },
  },
  plugins: [],
}
export default config

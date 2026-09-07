/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A36DE',
          50:  '#EDEAFF',
          100: '#DDD9FF',
          200: '#BBB3FF',
          300: '#9A8EFF',
          400: '#7868F8',
          500: '#5B47E8',
          600: '#4A36DE',
          700: '#3827C5',
          800: '#2B1FAF',
          900: '#1E1694',
        },
        accent: {
          DEFAULT: '#FA9E33',
          50:  '#FFF5E8',
          100: '#FFE9C9',
          200: '#FFD394',
          300: '#FFBC5F',
          400: '#FBA93C',
          500: '#FA9E33',
          600: '#E08820',
          700: '#C2720F',
        },
        app: {
          bg:      '#FAFAFC',
          card:    '#FFFFFF',
          border:  '#E5E5EE',
          text:    '#171720',
          subtext: '#74757F',
          success: '#29A666',
          error:   '#CC3333',
        },
        // Keep brand alias for any legacy references
        brand: {
          50:  '#EDEAFF',
          100: '#DDD9FF',
          400: '#7868F8',
          500: '#5B47E8',
          600: '#4A36DE',
          700: '#3827C5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '10': '10px',
        '12': '12px',
        '14': '14px',
        '16': '16px',
        '18': '18px',
        '20': '20px',
      },
      spacing: {
        '4.5': '18px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(23,23,32,0.06), 0 1px 2px rgba(23,23,32,0.04)',
        'card-hover': '0 4px 16px rgba(74,54,222,0.12), 0 1px 4px rgba(23,23,32,0.06)',
        'primary': '0 4px 14px rgba(74,54,222,0.35)',
      },
    },
  },
  plugins: [],
};

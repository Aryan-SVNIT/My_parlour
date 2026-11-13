/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blush: {
          50: '#fff5f7',
          100: '#ffe9ee',
          200: '#ffd2dc',
          300: '#ffacc0',
          400: '#ff7599',
          500: '#f54573',
          600: '#df2457',
          700: '#bc1441',
          800: '#9d143a',
          900: '#851636',
        },
        rosegold: {
          50: '#fbf7f6',
          100: '#f5edea',
          200: '#eedad4',
          300: '#dfbeb5',
          400: '#cb9a8e',
          500: '#b76e79',
          600: '#a35763',
          700: '#87444f',
          800: '#713b43',
          900: '#61343c',
        },
        nude: {
          50: '#fcfaf8',
          100: '#f8f4ef',
          200: '#f0e6dc',
          300: '#e5d3c2',
          400: '#d5b9a1',
          500: '#bc9678',
          600: '#a77f62',
          700: '#8a654e',
          800: '#715342',
          900: '#5e4538',
        },
        cream: {
          50: '#fdfcf9',
          100: '#fbf8f2',
          200: '#f6f0e4',
          300: '#eee3cd',
          400: '#e2cfaf',
          500: '#d4b78e',
        },
        charcoal: {
          800: '#2d2527',
          900: '#1e181a',
          950: '#140f11',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(183, 110, 121, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 10px 30px -4px rgba(183, 110, 121, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'rose': '0 8px 25px -4px rgba(183, 110, 121, 0.25)',
      }
    },
  },
  plugins: [],
}


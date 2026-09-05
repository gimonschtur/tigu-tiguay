/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        espresso: '#3B2417',
        cream: '#F1E4D0',
        card: '#FBF6EC',
        teal: '#1F7A72',
        gold: '#C98A2B',
        coral: '#D9714E',
        muted: '#8A6A4A',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

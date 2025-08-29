/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // src 폴더의 모든 파일을 포함
    "./public/index.html" // 필요하면 public 폴더의 HTML도 포함
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

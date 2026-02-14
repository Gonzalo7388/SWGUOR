import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores principales del logo
        primary: {
          50: '#fef8f3',   // Beige muy claro
          100: '#fef0e6',  // Beige claro
          200: '#fcdec7',  // Beige suave
          300: '#f9c79d',  // Dorado claro
          400: '#f5a869',  // Dorado medio
          500: '#d4945a',  // Dorado del logo
          600: '#b87947',  // Dorado oscuro
          700: '#935f38',  // Café dorado
          800: '#77502f',  // Café
          900: '#624128',  // Café oscuro
        },
        accent: {
          50: '#fef6f8',   // Rosa muy claro
          100: '#fdedf1',  // Rosa claro
          200: '#fbd9e3',  // Rosa suave del logo
          300: '#f8b8cc',  // Rosa medio
          400: '#f48dae',  // Rosa
          500: '#eb6591',  // Rosa vibrante
          600: '#d94876',  // Rosa oscuro
          700: '#b8365f',  // Rosa profundo
          800: '#982d50',  // Rosa muy oscuro
          900: '#7f2846',  // Rosa burgundy
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;

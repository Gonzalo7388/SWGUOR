import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/config/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      animation: {
        'thread-flow': 'thread 15s ease-in-out infinite',
        'thread-flow-slow': 'thread 20s ease-in-out infinite reverse',
      },
      keyframes: {
        thread: {
          '0%, 100%': {
            strokeDasharray: '0, 1000',
            strokeDashoffset: '0',
            transform: 'translateX(-5%)'
          },
          '50%': {
            strokeDasharray: '1000, 0',
            strokeDashoffset: '-100',
            transform: 'translateX(5%)'
          },
        }
      },
      colors: {
        // Variables CSS de shadcn
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // Paleta GUOR directa
        guor: {
          cream:  "#fff4e2",
          peach:  "#fbddd3",
          gold:   "#e4c28a",
          brown:  "#b5854b",
          dark:   "#231e1d",
        },
        admin: {
          cream: "#f7ead8",
          surface: "#fff8ee",
          line: "#e7d4bb",
          ink: "#1f1a16",
          soft: "#8f7a60",
          avatar: "#2a221b",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "admin-soft": "0 8px 24px -16px rgba(69, 48, 24, 0.35)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "admin-wash": "linear-gradient(135deg, #fffaf2 0%, #f7ead8 55%, #f1dfc7 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
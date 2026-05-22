import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/config/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
      'great-vibes': ['var(--font-great-vibes)', 'cursive'],
      },
      animation: {
        "thread-flow":      "thread 15s ease-in-out infinite",
        "thread-flow-slow": "thread 20s ease-in-out infinite reverse",
      },
      keyframes: {
        thread: {
          "0%, 100%": {
            strokeDasharray: "0, 1000",
            strokeDashoffset: "0",
            transform: "translateX(-5%)",
          },
          "50%": {
            strokeDasharray: "1000, 0",
            strokeDashoffset: "-100",
            transform: "translateX(5%)",
          },
        },
      },
      colors: {
        /* ── Shadcn CSS vars (no tocar) ── */
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        /* ── Paleta GUOR — rose/warm, moda & confección ── */
        guor: {
          50:    "#fff1f2",   // fondo hover suave
          100:   "#ffe4e6",   // surface tint
          200:   "#fecdd3",   // bordes accent
          300:   "#fda4af",   // icon suave
          400:   "#fb7185",   // hover activo
          500:   "#f43f5e",   // rose medio
          600:   "#e11d48",   // acento principal ← primary
          700:   "#be123c",   // hover presionado
          800:   "#881337",   // texto sobre claro
          900:   "#4c0519",   // texto invertido
          ink:   "#1c1917",   // texto principal (warm-black)
          soft:  "#78716c",   // texto secundario (warm-gray)
          line:  "#e7e5e4",   // bordes (warm-stone)
          bg:    "#fafaf9",   // fondo shell (off-white cálido)
          white: "#ffffff",
        },

        /* ── Utilidades de estado ── */
        status: {
          success: "#16a34a",
          warning: "#d97706",
          danger:  "#dc2626",
          info:    "#0369a1",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card:   "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.05)",
        modal:  "0 20px 60px -12px rgb(0 0 0 / 0.25)",
        subtle: "0 1px 0 0 hsl(var(--border))",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":  "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "erp-wash":        "linear-gradient(135deg, #fafaf9 0%, #fff1f2 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
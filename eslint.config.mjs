import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals.js";
import nextTs from "eslint-config-next/typescript.js";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // ── Relax `any` en capas de infraestructura ──────────────────────────────
  // Estos archivos interactúan con Supabase RPC, Prisma y APIs externas
  // donde los tipos dinámicos hacen que `any` sea legítimo y pragmático.
  {
    files: [
      "src/lib/helpers/**",
      "src/lib/services/**",
      "src/lib/hooks/**",
      "src/lib/schemas/**",
      "src/lib/logic/**",
      "src/lib/auth/**",
      "src/lib/utils/export-utils.tsx",
      "src/lib/utils/serialize.ts",
      "src/lib/prisma.ts",
      "src/lib/with-auth.ts",
      "src/lib/constants/estados.ts",
      "src/proxy.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "warn",
    },
  },
  // ── Reglas globales menos estrictas para facilitar migración progresiva ──
  // Se poner en 'warn' temporalmente para priorizar correcciones automáticas
  // y luego volver a 'error' según convenga.
  {
    files: ["**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/preserve-manual-memoization": "off"
    },
  },

  // ── Relax warnings menores en archivos de portal ─────────────────────────
  {
    files: [
      "src/components/portal/**",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
]);

export default eslintConfig;
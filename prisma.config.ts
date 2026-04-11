import 'dotenv/config'; // <-- Esto fuerza la lectura de tu archivo .env
import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: './prisma/schema',
  datasource: {
    url: process.env.DATABASE_URL as string, // Usamos process.env en lugar de env()
  },
});
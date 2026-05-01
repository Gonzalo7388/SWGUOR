import 'dotenv/config';
import { defineConfig } from '@prisma/config';

// Decidimos qué URL usar: si existe DIRECT_URL, la usamos para el CLI
const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

export default defineConfig({
  schema: './prisma/schema',
  datasource: {
    url: dbUrl as string, 
  },
});
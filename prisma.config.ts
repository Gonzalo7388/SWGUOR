import 'dotenv/config'
import { defineConfig } from '@prisma/config'

export default defineConfig({
  // Al no poner ".prisma" al final, Prisma sabe que debe leer 
  // todos los archivos dentro de la carpeta "prisma/schema"
  schema: 'prisma/schema', 
  
  datasource: {
    // Puerto 6543
    url: process.env.DATABASE_URL,
    
    // Puerto 5432 (Para evitar el error de prepared statement "s1")
    // @ts-ignore
    directUrl: process.env.DIRECT_URL,
  },
})
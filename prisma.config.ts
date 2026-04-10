import 'dotenv/config' // <--- ¡Añade esta línea mágica al principio!
import { defineConfig } from '@prisma/config'

export default defineConfig({
  // 1. Le decimos a Prisma dónde están tus archivos divididos
  schema: 'prisma/schema', 
  
  // 2. Aquí es donde ahora viven tus conexiones para las migraciones (CLI)
  datasource: {
    url: process.env.DATABASE_URL,
    // @ts-ignore: 'directUrl' no está en los tipos actuales pero es necesario para la conexión
    directUrl: process.env.DIRECT_URL,
  },
})
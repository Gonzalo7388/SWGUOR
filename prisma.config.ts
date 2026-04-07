// src/prisma.config.ts (O muévelo a la raíz si puedes)
export default {
  datasource: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },
}
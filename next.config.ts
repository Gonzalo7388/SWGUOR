import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  productionBrowserSourceMaps: false,

  /**
   * PRISMA 7 + NEXT.JS 16 FIX:
   * 'serverExternalPackages' obliga a Next.js a tratar a Prisma como un paquete 
   * de Node.js puro, evitando que Turbopack intente usar la versión WASM/Edge.
   */
  serverExternalPackages: ['@prisma/client'],

  /**
   * 'transpilePackages' asegura que los tipos generados por tus múltiples 
   * archivos .prisma se resuelvan correctamente en el servidor.
   */

  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, must-revalidate',
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/auth/login',
        permanent: false,
      },
      {
        source: '/login',
        destination: '/auth/login',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
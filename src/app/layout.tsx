import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils"; // Asegúrate de tener esta utilidad (estándar en shadcn)

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter', // Definimos una variable CSS para mayor flexibilidad
});

export const metadata: Metadata = {
  title: {
    default: "GUOR | Portal Corporativo B2B",
    template: "%s | GUOR"
  },
  description: "Plataforma inteligente de gestión textil y suministros para socios estratégicos de Modas y Estilos GUOR.",
  keywords: ["B2B", "Textil", "ERP", "IA", "Gestión de Pedidos", "Perú"],
  authors: [{ name: "Modas y Estilos GUOR" }],
};

// Configuración de la barra de estado y colores del navegador
export const viewport: Viewport = {
  themeColor: "#0f172a", // Slate-900 (el color de tu sidebar)
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body 
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          inter.className
        )}
      >
        {/* Notificaciones globales con diseño moderno */}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton 
          expand={false}
          theme="light"
        />
        
        {/* Contenido principal */}
        <div className="relative flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
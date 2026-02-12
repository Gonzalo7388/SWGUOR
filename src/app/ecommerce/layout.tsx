import type { Metadata } from "next";
import ClientLayout from "@/app/ecommerce/client-layout";

export const metadata: Metadata = {
  title: "Modas y Estilos GUOR | Ropa para mujer - PE GUOR Perú",
  description: "Tienda Virtual de Modas y Estilos GUOR. Descubre las últimas tendencias en moda femenina.",
  keywords: ["moda", "ropa mujer", "tienda online", "GUOR", "Perú", "fashion", "tendencias"],
  authors: [{ name: "GUOR" }],
  openGraph: {
    title: "Modas y Estilos GUOR | Ropa para mujer",
    description: "Tienda Virtual de Modas y Estilos GUOR",
    type: "website",
    locale: "es_PE",
    siteName: "GUOR Perú",
  },
  twitter: {
    card: "summary_large_image",
    title: "Modas y Estilos GUOR",
    description: "Tienda Virtual de Modas y Estilos GUOR",
  },
};

export default function EcommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
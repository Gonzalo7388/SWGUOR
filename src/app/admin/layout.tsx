import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceso Administrativo - Sistema GUOR",
  description: "Área de acceso para administradores del sistema",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
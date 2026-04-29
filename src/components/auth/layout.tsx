import GoldenThreadBackground from "@/components/auth/GoldenThreadBackground"; // Ajusta la ruta si es necesario

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="relative min-h-screen w-full">
      {/* El fondo se renderiza aquí una sola vez */}
      <GoldenThreadBackground />
      
      {/* El contenido del login debe tener un z-index superior */}
      <main className="relative z-20">
        {children}
      </main>
    </section>
  );
}
// src/app/(auth)/layout.tsx
import GoldenThreadBackground from "@/components/auth/GoldenThreadBackground";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8">
      <GoldenThreadBackground /> 
      
      {/*  CAMBIO: Quitamos el 'max-w-7xl' intermedio para que el 'mx-auto' del hijo mande */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </main>
  );
}
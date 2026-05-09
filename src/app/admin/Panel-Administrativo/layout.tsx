import type { Metadata } from "next";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import RealtimeLayoutWrapper from '@/components/admin/layout/RealtimeLayoutWrapper';
import ReactQueryProvider from '@/components/admin/provider/ReactQueryProvider';
import { PermissionsProvider } from '@/components/providers/PermissionsProvider';

export const metadata: Metadata = {
  title: "Sistema GUOR - Gestión de Modas",
  description: "Panel administrativo y control de inventarios",
  robots: { index: false, follow: false },
};

async function getValidatedUser(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) return { error: 'no_auth' };

  // Usar Prisma para una consulta directa a la base de datos (más rápido que Supabase HTTP)
  const usuario = await prisma.usuarios.findUnique({
    where: { auth_id: user.id },
    include: {
      personal_interno: {
        select: { nombre_completo: true }
      }
    }
  });

  if (!usuario) return { error: 'no_profile' };
  if (usuario.rol?.toLowerCase() === 'cliente') return { error: 'is_client' };
  if (usuario.estado?.toUpperCase() !== 'ACTIVO') return { error: 'inactive' };

  return { usuario };
}

export default async function PanelAdministrativoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* SSR Safe */ }
        },
      },
    }
  );

  const { usuario, error } = await getValidatedUser(supabase);

  // --- MANEJO DE REDIRECCIONES ACTUALIZADO ---
  
  // 1. Si no hay sesión o perfil, al login unificado
  if (error === 'no_auth' || error === 'no_profile') {
    redirect('/auth/login'); 
  }

  // 2. Si es un cliente intentando entrar a zona admin, al acceso denegado
  if (error === 'is_client') {
    redirect('/admin/acceso-denegado');
  }

  // 3. Si la cuenta está inactiva
  if (error === 'inactive') {
    redirect('/auth/login?error=cuenta_inactiva');
  }

  return (
    <ReactQueryProvider>
      <PermissionsProvider usuario={usuario as any}>
        <RealtimeLayoutWrapper initialUsuario={usuario as any}>
          <div className="admin-card min-h-screen bg-slate-50/50">
            {children}
          </div>
        </RealtimeLayoutWrapper>
      </PermissionsProvider>
    </ReactQueryProvider>
  );
}
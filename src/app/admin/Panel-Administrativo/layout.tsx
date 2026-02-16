import type { Metadata } from "next";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import RealtimeLayoutWrapper from '@/components/admin/layout/RealtimeLayoutWrapper';

export const metadata: Metadata = {
  title: "Sistema GUOR - Gestión de Modas",
  description: "Panel administrativo y control de inventarios",
  robots: { index: false, follow: false },
};

/**
 * Lógica de validación de usuario centralizada
 * Esto limpia el cuerpo del layout y facilita la depuración.
 */
async function getValidatedUser(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) return { error: 'no_auth' };

  const { data: usuario, error: usuarioError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  if (usuarioError || !usuario) return { error: 'no_profile' };
  
  if (usuario.estado?.toLowerCase() !== 'activo') return { error: 'inactive' };

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

  // Manejo centralizado de redirecciones
  if (error === 'no_auth' || error === 'no_profile') redirect('/admin/login');
  if (error === 'inactive') redirect('/admin/acceso-denegado?error=cuenta_inactiva');

  return (
    <RealtimeLayoutWrapper initialUsuario={usuario}>
      <div className="min-h-screen bg-slate-50/50">
        {children}
      </div>
    </RealtimeLayoutWrapper>
  );
}
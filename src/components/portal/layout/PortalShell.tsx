'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { usePortal } from '@/lib/hooks/usePortal';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { AsistenteIA } from '@/components/portal/layout/AsistenteIA';
import { PortalSidebar } from './PortalSidebar';
import { Navbar } from './PortalNavbar';
import { AlertCircle, LogOut, RefreshCw } from 'lucide-react';

interface PortalShellProps {
  children: React.ReactNode;
}

export function PortalShell({ children }: PortalShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const { loading, cliente } = usePortal();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!loading && !cliente) {
          const supabase = getSupabaseBrowserClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            router.replace('/auth/login?redirect=/portal/dashboard');
          }
        }
      } catch (err) {
        console.error('[PortalShell] Error comprobando sesión:', err);
      } finally {
        setCheckingSession(false);
      }
    };
    checkAuth();
  }, [loading, cliente, router]);

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace('/auth/login');
  };

  // 1. Mostrar pantalla de carga mientras sincroniza el hook o valida sesión nativa
  if (loading || (checkingSession && !cliente)) {
    return (
      <div className="min-h-screen bg-guor-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-guor-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-guor-soft text-sm font-medium animate-pulse">Sincronizando portal corporativo...</p>
        </div>
      </div>
    );
  }

  // 2. Control de Estado Fallido: Si terminó de cargar pero no encontró al cliente en la BD pública (Evita pantalla negra/nula)
  if (!cliente) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100 space-y-6">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500">
            <AlertCircle size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="text-slate-900 font-bold text-lg">Error de Sincronización</h2>
            <p className="text-slate-500 text-sm">
              Tu sesión está activa, pero no logramos asociar tu cuenta al registro de clientes de GUOR.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              <RefreshCw size={14} />
              Reintentar
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <LogOut size={14} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Renderizado Exitoso del Portal B2B
  return (
    <div className="min-h-screen bg-guor-bg flex overflow-hidden">
      <PortalSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-screen relative',
          collapsed ? 'pl-[68px]' : 'pl-[264px]',
        )}
      >
        <Navbar empresa={cliente.nombre_comercial ?? cliente.razon_social ?? undefined} />

        <main className="flex-1 relative overflow-y-auto px-6 py-8">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
          <AsistenteIA />
        </main>
      </div>
    </div>
  );
}
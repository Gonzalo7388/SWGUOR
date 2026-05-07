'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { usePortal } from '@/app/portal/_contexts/PortalContext';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { AsistenteIA } from '@/components/portal/AsistenteIA';
import { PortalSidebar } from './PortalSidebar';
import { Navbar } from './PortalNavbar';

interface PortalShellProps {
  children: React.ReactNode;
}

export function PortalShell({ children }: PortalShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { loading, cliente } = usePortal();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!loading && !cliente) {
        const supabase = getSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/auth/login?redirect=/portal/dashboard');
        }
      }
    };
    checkAuth();
  }, [loading, cliente, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff4e2] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#b5854b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!cliente) return null;

  return (
    <div className="min-h-screen bg-[#fff4e2] flex">
      <PortalSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 min-h-screen',
          collapsed ? 'ml-16' : 'ml-64',
        )}
      >
        <Navbar empresa={cliente.razon_social ?? cliente.nombre_comercial ?? undefined} />

        <main className="flex-1 relative">
          {children}
          <AsistenteIA />
        </main>
      </div>
    </div>
  );
}
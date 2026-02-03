'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import type { Usuario } from '@/types/database';

export default function RealtimeLayoutWrapper({ 
  initialUsuario, 
  children 
}: { 
  initialUsuario: Usuario, 
  children: React.ReactNode 
}) {
  const [usuario, setUsuario] = useState(initialUsuario);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    // Suscripción a cambios en la tabla 'usuarios' para este ID específico
    const channel = supabase
      .channel(`user-changes-${usuario.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'usuarios',
          filter: `id=eq.${usuario.id}`,
        },
        (payload) => {
            if (JSON.stringify(payload.new) !== JSON.stringify(usuario)) {
            setUsuario(payload.new as Usuario);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [usuario.id]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Ahora el Sidebar y Header usan el estado "usuario" que cambia solo */}
      <AdminSidebar usuario={usuario} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader usuario={usuario} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
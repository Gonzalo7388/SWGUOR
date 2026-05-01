"use client";

import { useEffect, useState, useRef } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import AdminSidebar from './Sidebar';
import AdminHeader from './Header';
import type { usuarios } from '@prisma/client';

export default function RealtimeLayoutWrapper({ 
  initialUsuario, 
  children 
}: { 
  initialUsuario: usuarios, 
  children: React.ReactNode 
}) {
  const [usuario, setUsuario] = useState<usuarios>(initialUsuario);
  const supabase = getSupabaseBrowserClient();
  
  // Usamos ref para mantener la referencia del usuario sin disparar efectos
  const usuarioRef = useRef(usuario);

  useEffect(() => {
    // Actualizar la referencia cuando el estado cambie
    usuarioRef.current = usuario;
  }, [usuario]);

  useEffect(() => {
    // Suscripción a cambios en la tabla 'usuarios'
    const channel = supabase
      .channel(`user-changes-${initialUsuario.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'usuarios',
          filter: `id=eq.${initialUsuario.id}`,
        },
        (payload) => {
          const newUser = payload.new as usuarios;
          
          // Comparación profunda básica para evitar actualizaciones innecesarias
          if (JSON.stringify(newUser) !== JSON.stringify(usuarioRef.current)) {
            setUsuario(newUser);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialUsuario.id, supabase]);

  return (
    <div className="admin-shell flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar usuario={usuario} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader usuario={usuario} />
        <main className="admin-content flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
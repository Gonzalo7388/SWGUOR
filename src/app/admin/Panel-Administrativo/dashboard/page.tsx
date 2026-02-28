"use client";

import { useMemo } from "react";
import dynamic from 'next/dynamic';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { Loader2, UserX, AlertTriangle, Sparkles } from "lucide-react";

// Lazy Loading para dashboards
const AdminDashboard = dynamic(() => import('@/components/admin/dashboards/DashboardAdmin'));
const DashboardAyudante = dynamic(() => import('@/components/admin/dashboards/DashboardAyudante'));
const DashboardCortador = dynamic(() => import('@/components/admin/dashboards/DashboardCortador'));
const DashboardDiseñador = dynamic(() => import('@/components/admin/dashboards/DashboardDiseñador'));
const DashboardRecepcionista = dynamic(() => import('@/components/admin/dashboards/DashboardRecepcionista'));
const DashboardRepresentante = dynamic(() => import('@/components/admin/dashboards/DashboardRepresentante'));

const DASHBOARDS_MAP: Record<string, React.ComponentType<any>> = {
  administrador: AdminDashboard,
  ayudante: DashboardAyudante,
  cortador: DashboardCortador,
  diseñador: DashboardDiseñador,
  recepcionista: DashboardRecepcionista,
  representante_taller: DashboardRepresentante,
};

export default function DashboardPage() {
  const { usuario, isLoading, hasRole } = usePermissions();

  const ActiveDashboard = useMemo(() => {
    if (!usuario || !usuario.rol) return null;
    
    // Mapeo directo de rol a componente sin necesidad de buscar en el objeto
    const component = DASHBOARDS_MAP[usuario.rol];
    return component || null;
  }, [usuario]);

  // Pantalla de carga - Minimalista
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3 bg-white">
        <Loader2 className="h-10 w-10 text-slate-400 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Cargando panel...</p>
      </div>
    );
  }

  // Pantalla si no hay usuario autenticado
  if (!usuario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 bg-white">
        <div className="p-4 rounded-full bg-slate-100 mb-5">
          <UserX className="w-10 h-10 text-slate-500" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-950 tracking-tight">Sesión finalizada</h1>
        <p className="text-slate-600 text-sm mt-2 max-w-sm">
          Por favor, inicia sesión nuevamente para continuar.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-[1700px] mx-auto px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {usuario.rol?.replace('_', ' ')}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-950 tracking-tight">
                Hola, {usuario.nombre_completo?.split(' ')[0] || "Usuario"}
              </h1>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                GUOR v2
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 md:p-8">
        <div className="max-w-[1700px] mx-auto">
          {ActiveDashboard ? (
            <ActiveDashboard usuario={usuario} />
          ) : (
            <div className="bg-white p-8 rounded-xl border border-slate-100 flex flex-col items-center text-center">
              <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
              <h2 className="text-xl font-semibold text-slate-950">Acceso restringido</h2>
              <p className="text-slate-600 text-sm mt-2">
                El rol <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">{usuario.rol}</span> no tiene un tablero configurado.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
"use client";

import { useMemo, useState } from "react";
import dynamic from 'next/dynamic';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { Loader2, UserX, AlertTriangle, Eye } from "lucide-react";

const AdminDashboard         = dynamic(() => import('@/components/admin/dashboards/DashboardAdministrador'));
const DashboardAyudante      = dynamic(() => import('@/components/admin/dashboards/DashboardAyudante'));
const DashboardCortador      = dynamic(() => import('@/components/admin/dashboards/DashboardCortador'));
const DashboardDisenador     = dynamic(() => import('@/components/admin/dashboards/DashboardDisenador'));
const DashboardRecepcionista = dynamic(() => import('@/components/admin/dashboards/DashboardRecepcionista'));
const DashboardRepresentante = dynamic(() => import('@/components/admin/dashboards/DashboardRepresentante'));
const DashboardGerente       = dynamic(() => import('@/components/admin/dashboards/DashboardGerente'));
const RoleDashboardTabs      = dynamic(() => import('@/components/admin/dashboards/RoleDashboardTab'));

const DASHBOARDS_MAP: Record<string, React.ComponentType<any>> = {
  administrador:        AdminDashboard,
  ayudante:             DashboardAyudante,
  cortador:             DashboardCortador,
  disenador:            DashboardDisenador,
  recepcionista:        DashboardRecepcionista,
  representante_taller: DashboardRepresentante,
  gerente:              DashboardGerente,
};

// Etiquetas legibles por rol
const ROL_LABELS: Record<string, string> = {
  administrador:        'Administrador',
  ayudante:             'Ayudante',
  cortador:             'Cortador',
  disenador:            'Diseñador',
  recepcionista:        'Recepcionista',
  representante_taller: 'Rep. de Taller',
  gerente:              'Gerente',
};

export default function DashboardPage() {
  const { usuario, isLoading } = usePermissions();
  const isGerente = usuario?.rol === 'gerente';

  // El gerente puede cambiar qué dashboard ve; los demás siempre ven el suyo
  const [activeRole, setActiveRole] = useState<string>('gerente');

  const resolvedRole = isGerente
    ? (activeRole ?? 'gerente')
    : (usuario?.rol ?? 'gerente');

  const ActiveDashboard = useMemo(() => {
  return DASHBOARDS_MAP[resolvedRole] ?? null;
  }, [resolvedRole]);

  // ── Estados de carga / error (sin cambios) ──────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Cargando panel...</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-6">
        <div className="p-4 rounded-full bg-slate-100 mb-4">
          <UserX className="w-8 h-8 text-slate-400" />
        </div>
        <h1 className="text-xl font-semibold text-slate-800">Sesión finalizada</h1>
        <p className="text-slate-500 text-sm mt-1">Por favor, inicia sesión nuevamente.</p>
      </div>
    );
  }

  if (!ActiveDashboard) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-6">
        <div className="p-4 rounded-full bg-amber-50 mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800">Acceso restringido</h2>
        <p className="text-slate-500 text-sm mt-1">
          El rol{' '}
          <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">
            {usuario.rol}
          </code>{' '}
          no tiene un tablero configurado.
        </p>
      </div>
    );
  }

  // ── Render principal ────────────────────────────────────────────────────
  return (
    <div>
      {/* Tabs de roles — solo para gerente */}
      {isGerente && (
        <RoleDashboardTabs
          activeRole={resolvedRole}
          onChange={setActiveRole}
        />
      )}

      {/* Badge: "estás viendo el panel de X" */}
      {isGerente && resolvedRole !== 'gerente' && (
        <div className="mb-5 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl w-fit">
          <Eye size={14} />
          <span>
            Viendo el panel de{' '}
            <strong>{ROL_LABELS[resolvedRole] ?? resolvedRole}</strong>
            {' — '}
            <button
              onClick={() => setActiveRole('gerente')}
              className="underline hover:no-underline font-semibold"
            >
              volver al tuyo
            </button>
          </span>
        </div>
      )}

      {/* Dashboard activo */}
      <ActiveDashboard usuario={usuario} />
    </div>
  );
}
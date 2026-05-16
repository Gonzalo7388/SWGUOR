'use client';

import { ShieldOff, ShieldCheck, Loader2, X, Briefcase, Hash, Phone, Calendar, Mail, User, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PersonalRow } from '@/lib/services/personal-interno.service';

const CARGO_LABELS: Record<string, string> = {
  gerente: 'Gerente',
  administrador: 'Administrador',
  disenador: 'Diseñador',
  cortador: 'Cortador',
  recepcionista: 'Recepcionista',
  ayudante: 'Ayudante',
  representante_taller: 'Rep. Taller',
};

const ROL_COLORS: Record<string, string> = {
  gerente: 'bg-violet-50 text-violet-700 border-violet-200',
  administrador: 'bg-sky-50 text-sky-700 border-sky-200',
  recepcionista: 'bg-pink-50 text-pink-700 border-pink-200',
  disenador: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  cortador: 'bg-orange-50 text-orange-600 border-orange-200',
  representante_taller: 'bg-lime-50 text-lime-700 border-lime-200',
  ayudante: 'bg-teal-50 text-teal-700 border-teal-200',
};

function formatDate(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
}

function timeAgo(d: string | null | undefined) {
  if (!d) return null;
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Hace un momento';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `Hace ${days} días`;
  return formatDate(d);
}

// ─────────────────────────────────────────────────────────────
// SUSPEND MODAL
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { toast } from 'sonner';

interface SuspendProps {
  personal: PersonalRow;
  onClose: () => void;
  onSuccess: () => void;
}

export function PersonalSuspendModal({ personal, onClose, onSuccess }: SuspendProps) {
  const [isSuspending, setIsSuspending] = useState(false);
  const activo = personal.estado === 'activo';
  const accion = activo ? 'Suspender' : 'Reactivar';
  
  const handleConfirm = async () => {
    setIsSuspending(true);
    try {
      const res = await fetch(`/api/admin/personal/${personal.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspender: activo }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message ?? `Error al ${accion.toLowerCase()} personal`);

      toast.success(
        activo
          ? `Acceso Revocado: ${personal.nombre_completo} ha sido suspendido`
          : `Acceso Restaurado: ${personal.nombre_completo} está activo nuevamente`,
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message ?? 'Error inesperado');
    } finally {
      setIsSuspending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${activo ? 'bg-amber-50' : 'bg-emerald-50'}`}>
          {activo ? (
            <ShieldOff className="w-7 h-7 text-amber-500" />
          ) : (
            <ShieldCheck className="w-7 h-7 text-emerald-500" />
          )}
        </div>
        <h3 className="text-lg font-bold text-gray-900">{accion} Credenciales</h3>
        <p className="text-sm text-gray-500 mt-2">
          ¿Estás seguro de {accion.toLowerCase()} el acceso de{' '}
          <span className="font-semibold text-gray-900">{personal.nombre_completo ?? 'este colaborador'}</span>?
          {activo ? ' Esto cerrará sus sesiones activas inmediatamente.' : ' Se restaurará su acceso al sistema.'}
        </p>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11" disabled={isSuspending}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className={`flex-1 h-11 text-white ${activo ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            disabled={isSuspending}
          >
            {isSuspending
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Procesando...</>
              : accion
            }
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAIL MODAL
// ─────────────────────────────────────────────────────────────

interface DetailProps {
  personal: PersonalRow;
  onClose: () => void;
}

export function PersonalDetailModal({ personal, onClose }: DetailProps) {
  const iniciales = (personal.nombre_completo ?? personal.usuarios?.email ?? '??')
    .substring(0, 2).toUpperCase();

  const fields = [
    { label: 'Cargo', value: CARGO_LABELS[personal.cargo ?? ''] ?? personal.cargo ?? '—', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { label: 'DNI', value: personal.dni ?? '—', icon: <Hash className="w-3.5 h-3.5" /> },
    { label: 'Teléfono', value: personal.telefono ?? '—', icon: <Phone className="w-3.5 h-3.5" /> },
    { label: 'Ingreso', value: formatDate(personal.fecha_ingreso) ?? '—', icon: <Calendar className="w-3.5 h-3.5" /> },
  ];

  const cuentaActiva = personal.usuarios?.estado === 'activo';

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
              cuentaActiva ? 'bg-teal-50 text-teal-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {iniciales}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {personal.nombre_completo ?? 'Sin nombre'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {personal.usuarios?.email ?? 'Sin correo registrado'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors shrink-0">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Datos Personales</h4>
            <div className="bg-gray-50/50 rounded-xl border p-2">
              {fields.map((f) => (
                <div key={f.label} className="flex justify-between items-center py-2 px-3 border-b last:border-0 border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500">
                    {f.icon}
                    <span className="text-xs font-semibold uppercase tracking-wider">{f.label}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{f.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Acceso al Sistema</h4>
            {personal.usuarios ? (
              <div className="bg-gray-50/50 rounded-xl border p-2">
                <div className="flex justify-between items-center py-2 px-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Rol</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] uppercase font-bold ${personal.usuarios.rol ? (ROL_COLORS[personal.usuarios.rol] ?? '') : ''}`}>
                    {personal.usuarios.rol ? personal.usuarios.rol.replace(/_/g, ' ') : 'Sin Rol'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 px-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Estado</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] uppercase font-bold ${cuentaActiva ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-600'}`}>
                    {personal.usuarios.estado}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 px-3">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Último acceso</span>
                  </div>
                  <span className="text-xs font-medium text-gray-900">{timeAgo(personal.usuarios.ultimo_acceso) ?? 'Sin registros'}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">Este colaborador no tiene un usuario de acceso vinculado.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

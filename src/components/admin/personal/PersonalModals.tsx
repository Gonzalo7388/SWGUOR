'use client';

import { UserX, Loader2, X, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PersonalRow } from '@/lib/services/personal-interno.service';

// ─────────────────────────────────────────────────────────────
// SUSPEND MODAL
// ─────────────────────────────────────────────────────────────

interface SuspendProps {
  personal: PersonalRow;
  isSuspending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function PersonalSuspendModal({ personal, isSuspending, onClose, onConfirm }: SuspendProps) {
  const isSuspendido = personal.estado === 'suspendido';

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isSuspendido ? 'bg-emerald-50' : 'bg-amber-50'
          }`}>
          {isSuspendido
            ? <UserCheck className="w-7 h-7 text-emerald-500" />
            : <UserX className="w-7 h-7 text-amber-500" />
          }
        </div>

        <h3 className="text-lg font-bold text-gray-900">
          {isSuspendido ? 'Reactivar Colaborador' : 'Suspender Colaborador'}
        </h3>

        <p className="text-sm text-gray-500 mt-2">
          {isSuspendido ? (
            <>
              ¿Reactivar a{' '}
              <span className="font-semibold text-gray-900">{personal.nombre_completo}</span>?
              {' '}Recuperará su acceso al sistema.
            </>
          ) : (
            <>
              ¿Suspender a{' '}
              <span className="font-semibold text-gray-900">{personal.nombre_completo}</span>?
              {' '}Se bloqueará su acceso pero sus datos se conservarán.
            </>
          )}
        </p>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-11"
            disabled={isSuspending}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSuspending}
            className={`flex-1 h-11 text-white ${isSuspendido
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-500 hover:bg-amber-600'
              }`}
          >
            {isSuspending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {isSuspendido ? 'Reactivando...' : 'Suspendiendo...'}
              </>
            ) : (
              isSuspendido ? 'Reactivar' : 'Suspender'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAIL MODAL
// ─────────────────────────────────────────────────────────────

const CARGO_LABELS: Record<string, string> = {
  gerente: 'Gerente',
  administrador: 'Administrador',
  disenador: 'Diseñador',
  cortador: 'Cortador',
  representante_taller: 'Rep. de Taller',
  recepcionista: 'Recepcionista',
  ayudante: 'Ayudante',
};

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
  activo: { label: 'Activo', color: 'text-emerald-600 bg-emerald-50' },
  inactivo: { label: 'Inactivo', color: 'text-gray-500 bg-gray-100' },
  suspendido: { label: 'Suspendido', color: 'text-amber-600 bg-amber-50' },
};

interface DetailProps {
  personal: PersonalRow;
  onClose: () => void;
}

export function PersonalDetailModal({ personal, onClose }: DetailProps) {
  const estado = ESTADO_CONFIG[personal.estado ?? 'inactivo'] ?? ESTADO_CONFIG.inactivo;

  const initials = (personal.nombre_completo ?? personal.usuarios?.email ?? '??')
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase();

  const fields = [
    { label: 'DNI', value: personal.dni ?? '—' },
    { label: 'Cargo', value: CARGO_LABELS[personal.cargo ?? ''] ?? personal.cargo ?? '—' },
    { label: 'Teléfono', value: personal.telefono ?? '—' },
    {
      label: 'Fecha de ingreso',
      value: personal.fecha_ingreso
        ? new Date(personal.fecha_ingreso).toLocaleDateString('es-PE', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
        : '—',
    },
    { label: 'Estado', value: estado.label },
    { label: 'Correo', value: personal.usuarios?.email ?? '—' },
    { label: 'Rol de acceso', value: personal.usuarios?.rol ?? '—' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — mismo patrón que ProveedorDetailModal */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-xl">
              <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-black text-teal-700">{initials}</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {personal.nombre_completo || personal.usuarios?.email || '—'}
              </h3>
              <p className="text-xs text-gray-500">DNI: {personal.dni ?? '—'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Fields — mismo patrón que ProveedorDetailModal */}
        <div className="p-6 space-y-3">
          {fields.map((f) => (
            <div
              key={f.label}
              className="flex justify-between items-center py-2 border-b last:border-0"
            >
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {f.label}
              </span>
              <span className="text-sm font-medium text-gray-900">{String(f.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
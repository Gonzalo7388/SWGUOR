'use client';

// GUOR PRO Modal Design — Almacenes
import { Warehouse, Loader2, Trash2, X, Package, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─────────────────────────────────────────────────────────────
// DELETE MODAL
// ─────────────────────────────────────────────────────────────

interface DeleteProps {
  almacen:    any;
  isDeleting: boolean;
  onClose:    () => void;
  onConfirm:  () => void;
}

export function AlmacenDeleteModal({ almacen, isDeleting, onClose, onConfirm }: DeleteProps) {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Desactivar Almacén</h3>
        <p className="text-sm text-gray-500 mt-2">
          ¿Estás seguro de desactivar{' '}
          <span className="font-semibold text-gray-900">{almacen?.nombre}</span>?
          Esta acción es un borrado lógico y se puede revertir.
        </p>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11" disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white"
            disabled={isDeleting}
          >
            {isDeleting
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Desactivando...</>
              : 'Desactivar'
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
  almacen: any;
  onClose: () => void;
}

export function AlmacenDetailModal({ almacen, onClose }: DetailProps) {
  const fields = [
    { label: 'Nombre',     value: almacen.nombre },
    { label: 'Dirección',  value: almacen.direccion },
    { label: 'Capacidad',  value: almacen.capacidad_total ? `${almacen.capacidad_total} ${almacen.unidad_capacidad ?? ''}` : null },
    { label: 'Estado',     value: almacen.estado === 'activo' ? 'Activo' : 'Inactivo' },
    { label: 'Notas',      value: almacen.descripcion },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 rounded-xl">
              <Warehouse className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{almacen.nombre}</h3>
              {almacen.direccion && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />{almacen.direccion}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Fields */}
        <div className="p-6 space-y-3">
          {fields.map(f => (
            <div key={f.label} className="flex justify-between items-center py-2 border-b last:border-0">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{f.label}</span>
              <span className="text-sm font-medium text-gray-900">{f.value || '—'}</span>
            </div>
          ))}
          {typeof almacen._count?.insumos === 'number' && (
            <div className="flex justify-between items-center py-2 border-b last:border-0">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Package className="w-3 h-3" /> Insumos
              </span>
              <span className="text-sm font-medium text-gray-900">{almacen._count.insumos}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

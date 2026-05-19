'use client';

import { useState } from 'react';
import { UserMinus, UserCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { ClienteListItem } from '@/lib/services/clientes.service';

// ─────────────────────────────────────────────────────────────
// SUSPEND MODAL
// ─────────────────────────────────────────────────────────────

interface SuspendProps {
  cliente: ClienteListItem;
  onClose: () => void;
  onSuccess: () => void;
}

export function ClienteSuspendModal({ cliente, onClose, onSuccess }: SuspendProps) {
  const [isSuspending, setIsSuspending] = useState(false);
  const activo = cliente.activo === 'activo';
  const accion = activo ? 'Suspender' : 'Reactivar';
  const display = cliente.razon_social ?? cliente.email;
  const nuevoEstado = activo ? 'inactivo' : 'activo';
  
  const handleConfirm = async () => {
    setIsSuspending(true);
    try {
      const res = await fetch(`/api/admin/clientes/${cliente.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message ?? `Error al ${accion.toLowerCase()} cliente`);

      toast.success(
        activo
          ? `Operación exitosa: Acceso restringido para ${display}`
          : `Operación exitosa: Acceso restaurado para ${display}`,
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
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${activo ? 'bg-amber-50' : 'bg-indigo-50'}`}>
          {activo ? (
            <UserMinus className="w-7 h-7 text-amber-500" />
          ) : (
            <UserCheck className="w-7 h-7 text-indigo-500" />
          )}
        </div>
        <h3 className="text-lg font-bold text-gray-900">{accion} Acceso</h3>
        <p className="text-sm text-gray-500 mt-2">
          ¿Estás seguro de {accion.toLowerCase()} el acceso de{' '}
          <span className="font-semibold text-gray-900">{display}</span>?
          {activo ? ' Esto evitará que el cliente pueda realizar nuevos pedidos.' : ' Se restaurará su capacidad comercial.'}
        </p>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11" disabled={isSuspending}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className={`flex-1 h-11 text-white ${activo ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
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

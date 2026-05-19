'use client';

import { useState } from 'react';
import { ShieldOff, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { usuarios } from '@prisma/client';

interface SuspendProps {
  usuario: usuarios;
  onClose: () => void;
  onSuccess: () => void;
}

export function UsuarioSuspendModal({ usuario, onClose, onSuccess }: SuspendProps) {
  const [isSuspending, setIsSuspending] = useState(false);

  // inactivo y suspendido = bloqueado; cualquiera puede reactivarse
  const bloqueado = usuario.estado !== 'activo';
  const accion = bloqueado ? 'Reactivar' : 'Suspender';

  const handleConfirm = async () => {
    setIsSuspending(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${usuario.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: bloqueado ? 'activo' : 'suspendido' }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message ?? body?.error ?? `Error al ${accion.toLowerCase()} usuario`);

      toast.success(
        bloqueado
          ? `Acceso Restaurado: ${usuario.email} está activo nuevamente`
          : `Acceso Revocado: ${usuario.email} ha sido suspendido`,
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
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${bloqueado ? 'bg-emerald-50' : 'bg-amber-50'}`}>
          {bloqueado
            ? <ShieldCheck className="w-7 h-7 text-emerald-500" />
            : <ShieldOff className="w-7 h-7 text-amber-500" />
          }
        </div>
        <h3 className="text-lg font-bold text-gray-900">{accion} Credenciales</h3>
        <p className="text-sm text-gray-500 mt-2">
          ¿Estás seguro de {accion.toLowerCase()} el acceso de{' '}
          <span className="font-semibold text-gray-900">{usuario.email}</span>?
          {bloqueado
            ? ' Se restaurará su acceso al sistema.'
            : ' Esto bloqueará su acceso a los módulos administrativos.'
          }
        </p>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11" disabled={isSuspending}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className={`flex-1 h-11 text-white ${bloqueado ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}`}
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
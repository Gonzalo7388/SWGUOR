'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { aprobarCotizacion, rechazarCotizacion } from '@/app/admin/Panel-Administrativo/cotizaciones/actions';

interface CotizacionActionsProps {
  cotizacionId: number;
  estado: string;
  validaHasta: string;
}

export function CotizacionActions({
  cotizacionId,
  estado,
  validaHasta,
}: CotizacionActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Verificar si está expirada
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiracionDate = new Date(validaHasta);
  expiracionDate.setHours(0, 0, 0, 0);
  const estaExpirada = estado === 'pendiente' && today > expiracionDate;

  const handleApprove = async () => {
    if (estaExpirada) {
      toast.error('No se puede aprobar una cotización expirada');
      return;
    }

    try {
      setLoading(true);
      const result = await aprobarCotizacion(BigInt(cotizacionId));

      if (!result.success) {
        toast.error(result.error ?? 'Error al aprobar la cotización');
        return;
      }

      toast.success(
        result.pedidoId
          ? `Cotización aprobada. Pedido #${result.pedidoId} creado automáticamente.`
          : 'Cotización aprobada exitosamente'
      );

      router.refresh();
    } catch (error) {
      toast.error('Error inesperado al aprobar la cotización');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      const result = await rechazarCotizacion(BigInt(cotizacionId), rejectReason);

      if (!result.success) {
        toast.error(result.error ?? 'Error al rechazar la cotización');
        return;
      }

      toast.success('Cotización rechazada');
      setRejectDialogOpen(false);
      setRejectReason('');
      router.refresh();
    } catch (error) {
      toast.error('Error inesperado al rechazar la cotización');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Solo mostrar acciones si es recepcionista o admin y estado es pendiente/borrador
  if (!['pendiente', 'borrador'].includes(estado)) {
    return null;
  }

  return (
    <>
      <div className="flex gap-3">
        <Button
          onClick={handleApprove}
          disabled={loading || estaExpirada}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Procesando...
            </>
          ) : estaExpirada ? (
            <>
              <AlertTriangle size={16} />
              Expirada
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              Aprobar
            </>
          )}
        </Button>

        <Button
          onClick={() => setRejectDialogOpen(true)}
          disabled={loading}
          variant="outline"
          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 font-bold uppercase gap-2"
        >
          <XCircle size={16} />
          Rechazar
        </Button>
      </div>

      {/* Diálogo de rechazo */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase text-red-600">
              Rechazar Cotización
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-bold text-xs uppercase">
              Esta acción no se puede deshacer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800 font-medium">
                ¿Está seguro que desea rechazar esta cotización? Se notificará al cliente.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400">
                Motivo del rechazo (opcional)
              </label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ej: Precio no disponible, producto agotado, etc."
                className="min-h-[100px] border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3 sm:justify-end">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                className="font-bold uppercase"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleReject}
              disabled={loading}
              variant="destructive"
              className="font-bold uppercase gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <XCircle size={16} />
                  Confirmar Rechazo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

'use client';

import { useState } from 'react';
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
import {
  aprobarCotizacion,
  rechazarCotizacion,
} from '@/lib/helpers/cotizaciones-helpers';

interface CotizacionActionsProps {
  cotizacionId: number;
  estado: string;
  validaHasta: string;
  onSuccess?: () => void;
}

export function CotizacionActions({
  cotizacionId,
  estado,
  validaHasta,
  onSuccess,
}: CotizacionActionsProps) {
  const [loading, setLoading]                     = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen]   = useState(false);
  const [rejectReason, setRejectReason]           = useState('');

  if (!['borrador', 'enviada'].includes(estado)) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiracion = new Date(validaHasta);
  expiracion.setHours(0, 0, 0, 0);
  const estaExpirada = estado === 'enviada' && today > expiracion;

  const handleApprove = async () => {
    if (estaExpirada) {
      toast.error('No se puede aprobar una cotización expirada');
      return;
    }
    try {
      setLoading(true);
      const result = await aprobarCotizacion(cotizacionId.toString());
      if (!result.success) {
        toast.error(result.error ?? 'Error al aprobar la cotización');
        return;
      }
      toast.success(
        result?.pedidoId
          ? `Cotización aprobada — Pedido #${result.pedidoId} creado`
          : 'Cotización aprobada exitosamente'
      );
      onSuccess?.();
    } catch {
      toast.error('Error inesperado al aprobar');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      const result = await rechazarCotizacion(cotizacionId.toString(), rejectReason || undefined);
      if (!result.success) {
        toast.error(result.error ?? 'Error al rechazar la cotización');
        return;
      }
      toast.success('Cotización rechazada');
      setRejectDialogOpen(false);
      setRejectReason('');
      onSuccess?.();
    } catch {
      toast.error('Error inesperado al rechazar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleApprove}
          disabled={loading || estaExpirada}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-xs gap-1.5 h-8"
        >
          {loading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : estaExpirada ? (
            <><AlertTriangle size={13} /> Expirada</>
          ) : (
            <><CheckCircle2 size={13} /> Aprobar</>
          )}
        </Button>

        <Button
          size="sm"
          onClick={() => setRejectDialogOpen(true)}
          disabled={loading}
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50 font-bold uppercase text-xs gap-1.5 h-8"
        >
          <XCircle size={13} /> Rechazar
        </Button>
      </div>

      {/* ── Diálogo de rechazo ── */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase text-red-600">
              Rechazar Cotización
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-bold text-xs uppercase">
              Esta acción no se puede deshacer fácilmente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800 font-medium">
                ¿Está seguro que desea rechazar esta cotización?
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400">
                Motivo del rechazo (opcional)
              </label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ej: Precio no disponible, producto agotado..."
                className="min-h-[100px] border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3 sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading} className="font-bold uppercase">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleReject}
              disabled={loading}
              variant="destructive"
              className="font-bold uppercase gap-2"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Procesando...</>
                : <><XCircle size={15} /> Confirmar Rechazo</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
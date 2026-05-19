'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { notificacionBaseSchema as notificacionSchema, type Notificacion as NotificacionInput } from '@/lib/schemas/notificaciones';
import { TipoNotificacion } from '@prisma/client';

// Etiquetas legibles para cada valor del enum
const TIPO_LABELS: Record<TipoNotificacion, string> = {
  stock_bajo: 'Stock bajo',
  pedido_vencido: 'Pedido vencido',
  pago_pendiente: 'Pago pendiente',
  cotizacion_expirada: 'Cotización expirada',
  orden_produccion: 'Orden de producción',
  confeccion_completada: 'Confección completada',
  devolucion_solicitada: 'Devolución solicitada',
  sistema: 'Sistema',
};

const TIPOS = Object.values(TipoNotificacion) as TipoNotificacion[];

const FORM_INICIAL: Partial<NotificacionInput> = {
  usuario_id: undefined,
  titulo: '',
  mensaje: '',
  tipo: 'sistema',
  leido: false,
};

interface NotificacionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: NotificacionInput) => void;
}

export default function NotificacionDialog({ open, onOpenChange, onSave }: NotificacionDialogProps) {
  const [formData, setFormData] = useState<Partial<NotificacionInput>>(FORM_INICIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetea el form cada vez que se abre
  useEffect(() => {
    if (open) {
      setFormData(FORM_INICIAL);
      setErrors({});
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = notificacionSchema.safeParse(formData);

    if (!result.success) {
      const zodErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) zodErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(zodErrors);
      return;
    }

    onSave(result.data);
  };

  const set = (field: keyof NotificacionInput, value: unknown) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Notificación</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Usuario */}
          <div className="space-y-1">
            <Label htmlFor="usuario_id">ID Usuario</Label>
            <Input
              id="usuario_id"
              type="number"
              min={1}
              value={formData.usuario_id ?? ''}
              onChange={(e) => set('usuario_id', parseInt(e.target.value) || undefined)}
            />
            {errors.usuario_id && <p className="text-xs text-red-500">{errors.usuario_id}</p>}
          </div>

          {/* Tipo */}
          <div className="space-y-1">
            <Label>Tipo</Label>
            <Select
              value={formData.tipo}
              onValueChange={(v) => set('tipo', v as TipoNotificacion)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TIPO_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tipo && <p className="text-xs text-red-500">{errors.tipo}</p>}
          </div>

          {/* Título */}
          <div className="space-y-1">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={formData.titulo ?? ''}
              onChange={(e) => set('titulo', e.target.value)}
              maxLength={100}
            />
            {errors.titulo && <p className="text-xs text-red-500">{errors.titulo}</p>}
          </div>

          {/* Mensaje */}
          <div className="space-y-1">
            <Label htmlFor="mensaje">Mensaje</Label>
            <Textarea
              id="mensaje"
              value={formData.mensaje ?? ''}
              onChange={(e) => set('mensaje', e.target.value)}
              rows={3}
              maxLength={500}
            />
            {errors.mensaje && <p className="text-xs text-red-500">{errors.mensaje}</p>}
          </div>

          {/* URL destino (opcional) */}
          <div className="space-y-1">
            <Label htmlFor="url_destino">URL destino <span className="text-slate-400 text-xs">(opcional)</span></Label>
            <Input
              id="url_destino"
              type="url"
              placeholder="https://..."
              value={formData.url_destino ?? ''}
              onChange={(e) => set('url_destino', e.target.value || undefined)}
            />
            {errors.url_destino && <p className="text-xs text-red-500">{errors.url_destino}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Enviar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { notificacionSchema, NotificacionInput } from '@/lib/schemas/notificaciones';

interface NotificacionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: NotificacionInput) => void;
}

export default function NotificacionDialog({
  open,
  onOpenChange,
  onSave,
}: NotificacionDialogProps) {
  const [formData, setFormData] = useState<Partial<NotificacionInput>>({
    usuario_id: 0,
    titulo: '',
    mensaje: '',
    tipo: 'info',
    leida: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      usuario_id: 0,
      titulo: '',
      mensaje: '',
      tipo: 'info',
      leida: false,
    });
    setErrors({});
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = notificacionSchema.parse(formData);
      onSave(validated);
    } catch (error: any) {
      const zodErrors: Record<string, string> = {};
      error.errors.forEach((err: any) => {
        zodErrors[err.path[0]] = err.message;
      });
      setErrors(zodErrors);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Notificación</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="usuario_id">ID Usuario</Label>
            <Input
              id="usuario_id"
              type="number"
              value={formData.usuario_id || ''}
              onChange={(e) => setFormData({ ...formData, usuario_id: parseInt(e.target.value) || 0 })}
              required
            />
            {errors.usuario_id && <p className="text-sm text-red-500">{errors.usuario_id}</p>}
          </div>

          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={formData.titulo || ''}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
            />
            {errors.titulo && <p className="text-sm text-red-500">{errors.titulo}</p>}
          </div>

          <div>
            <Label htmlFor="mensaje">Mensaje</Label>
            <Textarea
              id="mensaje"
              value={formData.mensaje || ''}
              onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
              rows={3}
              required
            />
            {errors.mensaje && <p className="text-sm text-red-500">{errors.mensaje}</p>}
          </div>

          <div>
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && <p className="text-sm text-red-500">{errors.tipo}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Enviar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { feedbackClienteSchema, FeedbackClienteInput } from '@/lib/schemas/feedback-cliente';

interface FeedbackClienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: FeedbackClienteInput) => void;
  feedback?: any;
}

export default function FeedbackClienteDialog({
  open,
  onOpenChange,
  onSave,
  feedback,
}: FeedbackClienteDialogProps) {
  const [formData, setFormData] = useState<Partial<FeedbackClienteInput>>({
    cliente_id: 0,
    pedido_id: undefined,
    puntuacion: 5,
    comentario: '',
    tipo_feedback: 'positivo',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (feedback) {
      setFormData({
        cliente_id: feedback.cliente_id,
        pedido_id: feedback.pedido_id,
        puntuacion: feedback.puntuacion,
        comentario: feedback.comentario || '',
        tipo_feedback: feedback.tipo_feedback,
      });
    } else {
      setFormData({
        cliente_id: 0,
        pedido_id: undefined,
        puntuacion: 5,
        comentario: '',
        tipo_feedback: 'positivo',
      });
    }
    setErrors({});
  }, [feedback, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = feedbackClienteSchema.parse(formData);
      onSave(validated);
    } catch (error: any) {
      const zodErrors: Record<string, string> = {};
      error.errors.forEach((err: any) => {
        zodErrors[err.path[0]] = err.message;
      });
      setErrors(zodErrors);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-6 h-6 cursor-pointer ${
          i < (formData.puntuacion || 0)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
        onClick={() => setFormData({ ...formData, puntuacion: i + 1 })}
      />
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {feedback ? 'Editar Feedback' : 'Crear Feedback'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cliente_id">ID Cliente</Label>
            <Input
              id="cliente_id"
              type="number"
              value={formData.cliente_id || ''}
              onChange={(e) => setFormData({ ...formData, cliente_id: parseInt(e.target.value) || 0 })}
              required
            />
            {errors.cliente_id && <p className="text-sm text-red-500">{errors.cliente_id}</p>}
          </div>

          <div>
            <Label htmlFor="pedido_id">ID Pedido (opcional)</Label>
            <Input
              id="pedido_id"
              type="number"
              value={formData.pedido_id || ''}
              onChange={(e) => setFormData({ ...formData, pedido_id: parseInt(e.target.value) || undefined })}
            />
          </div>

          <div>
            <Label>Puntuación</Label>
            <div className="flex gap-1 mt-1">
              {renderStars()}
            </div>
            {errors.puntuacion && <p className="text-sm text-red-500">{errors.puntuacion}</p>}
          </div>

          <div>
            <Label htmlFor="tipo_feedback">Tipo de Feedback</Label>
            <Select
              value={formData.tipo_feedback}
              onValueChange={(value: any) => setFormData({ ...formData, tipo_feedback: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="positivo">Positivo</SelectItem>
                <SelectItem value="negativo">Negativo</SelectItem>
                <SelectItem value="sugerencia">Sugerencia</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo_feedback && <p className="text-sm text-red-500">{errors.tipo_feedback}</p>}
          </div>

          <div>
            <Label htmlFor="comentario">Comentario (opcional)</Label>
            <Textarea
              id="comentario"
              value={formData.comentario || ''}
              onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
              rows={3}
            />
            {errors.comentario && <p className="text-sm text-red-500">{errors.comentario}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {feedback ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { almacenSchema, AlmacenInput } from '@/lib/schemas/almacen';

interface AlmacenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: AlmacenInput) => void;
  almacen?: any;
}

export default function AlmacenDialog({
  open,
  onOpenChange,
  onSave,
  almacen,
}: AlmacenDialogProps) {
  const [formData, setFormData] = useState<Partial<AlmacenInput>>({
    nombre: '',
    descripcion: '',
    ubicacion: '',
    capacidad_maxima: undefined,
    estado: 'activo',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (almacen) {
      setFormData({
        nombre: almacen.nombre,
        descripcion: almacen.descripcion || '',
        ubicacion: almacen.ubicacion || '',
        capacidad_maxima: almacen.capacidad_maxima,
        estado: almacen.estado,
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        ubicacion: '',
        capacidad_maxima: undefined,
        estado: 'activo',
      });
    }
    setErrors({});
  }, [almacen, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = almacenSchema.parse(formData);
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
          <DialogTitle>
            {almacen ? 'Editar Almacén' : 'Crear Almacén'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre || ''}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
            {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion || ''}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={2}
            />
            {errors.descripcion && <p className="text-sm text-red-500">{errors.descripcion}</p>}
          </div>

          <div>
            <Label htmlFor="ubicacion">Ubicación</Label>
            <Input
              id="ubicacion"
              value={formData.ubicacion || ''}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
            />
            {errors.ubicacion && <p className="text-sm text-red-500">{errors.ubicacion}</p>}
          </div>

          <div>
            <Label htmlFor="capacidad_maxima">Capacidad Máxima</Label>
            <Input
              id="capacidad_maxima"
              type="number"
              value={formData.capacidad_maxima || ''}
              onChange={(e) => setFormData({ ...formData, capacidad_maxima: parseInt(e.target.value) || undefined })}
            />
            {errors.capacidad_maxima && <p className="text-sm text-red-500">{errors.capacidad_maxima}</p>}
          </div>

          <div>
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value: any) => setFormData({ ...formData, estado: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
            {errors.estado && <p className="text-sm text-red-500">{errors.estado}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {almacen ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
'use client';

// GUOR PRO Modal Design — Categorías
import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface CategoriaForm {
  nombre:      string;
  descripcion: string;
  activo:      boolean;
}

interface Props {
  categoria: any | null;
  isSaving:  boolean;
  onClose:   () => void;
  onSave:    (data: CategoriaForm) => void;
}

const EMPTY: CategoriaForm = { nombre: '', descripcion: '', activo: true };

export default function CategoriaFormModal({ categoria, isSaving, onClose, onSave }: Props) {
  const [form, setForm]     = useState<CategoriaForm>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (categoria) {
      setForm({
        nombre:      categoria.nombre      ?? '',
        descripcion: categoria.descripcion ?? '',
        activo:      categoria.activo      ?? true,
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [categoria]);

  const handleChange = (field: keyof CategoriaForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const c = { ...prev }; delete c[field]; return c; });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setErrors({ nombre: 'El nombre de la categoría es requerido' });
      return;
    }
    onSave(form);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {categoria ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {categoria ? 'Ajusta los detalles de la línea de productos' : 'Define una nueva línea para tu catálogo'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre de la Línea *</label>
            <Input
              value={form.nombre}
              onChange={e => handleChange('nombre', e.target.value)}
              placeholder="Ej. Vestidos de Gala"
              className={errors.nombre ? 'border-red-400 focus:ring-red-400' : ''}
            />
            {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descripción</label>
            <Textarea
              value={form.descripcion}
              onChange={e => handleChange('descripcion', e.target.value)}
              placeholder="¿Qué tipo de prendas incluye esta categoría?"
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado Actual</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {form.activo ? 'Visible en Catálogo' : 'Oculta al Público'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleChange('activo', !form.activo)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                form.activo ? 'bg-rose-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  form.activo ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11" disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 text-white" disabled={isSaving}>
              {isSaving
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Guardando...</>
                : categoria ? 'Actualizar' : 'Crear Categoría'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

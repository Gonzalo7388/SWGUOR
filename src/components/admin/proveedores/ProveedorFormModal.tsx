'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { proveedorSchema, CATEGORIAS_SUMINISTRO } from '@/lib/schemas/proveedor';
import type { Proveedor, ProveedorForm } from '@/lib/schemas/proveedor';

interface Props {
  proveedor: Proveedor | null;
  isSaving:  boolean;
  onClose:   () => void;
  onSave:    (data: ProveedorForm) => void;
}

export default function ProveedorFormModal({ proveedor, isSaving, onClose, onSave }: Props) {
  const [form, setForm] = useState<ProveedorForm>({
    id:                   proveedor?.id ?? '',
    ruc:                  proveedor?.ruc ?? '',
    razon_social:         proveedor?.razon_social ?? '',
    contacto:             proveedor?.contacto ?? '',
    telefono:             proveedor?.telefono ?? '',
    email:                proveedor?.email ?? '',
    direccion:            proveedor?.direccion ?? '',
    categoria_suministro: (proveedor?.categoria_suministro as any) ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof ProveedorForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = proveedorSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const key = String(err.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    onSave({ ...result.data, id: proveedor?.id });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {proveedor ? 'Actualiza los datos del proveedor' : 'Registra un nuevo proveedor de suministro'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">RUC *</label>
              <Input
                value={form.ruc}
                onChange={(e) => handleChange('ruc', e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="20123456789"
                maxLength={11}
                className={errors.ruc ? 'border-red-400 focus:ring-red-400' : ''}
              />
              {errors.ruc && <p className="text-xs text-red-500 mt-1">{errors.ruc}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Categoría *</label>
              <select
                value={form.categoria_suministro}
                onChange={(e) => handleChange('categoria_suministro', e.target.value)}
                className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                  errors.categoria_suministro ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                <option value="">Seleccionar...</option>
                {CATEGORIAS_SUMINISTRO.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.categoria_suministro && (
                <p className="text-xs text-red-500 mt-1">{errors.categoria_suministro}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Razón Social *</label>
            <Input
              value={form.razon_social}
              onChange={(e) => handleChange('razon_social', e.target.value)}
              placeholder="Empresa S.A.C."
              className={errors.razon_social ? 'border-red-400' : ''}
            />
            {errors.razon_social && <p className="text-xs text-red-500 mt-1">{errors.razon_social}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Persona de Contacto *</label>
            <Input
              value={form.contacto}
              onChange={(e) => handleChange('contacto', e.target.value)}
              placeholder="Nombre completo"
              className={errors.contacto ? 'border-red-400' : ''}
            />
            {errors.contacto && <p className="text-xs text-red-500 mt-1">{errors.contacto}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Teléfono *</label>
              <Input
                value={form.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="+51 999 999 999"
                className={errors.telefono ? 'border-red-400' : ''}
              />
              {errors.telefono && <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email *</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contacto@empresa.com"
                className={errors.email ? 'border-red-400' : ''}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Dirección *</label>
            <Input
              value={form.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              placeholder="Av. Principal 123, Lima"
              className={errors.direccion ? 'border-red-400' : ''}
            />
            {errors.direccion && <p className="text-xs text-red-500 mt-1">{errors.direccion}</p>}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11" disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 text-white" disabled={isSaving}>
              {isSaving
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Guardando...</>
                : proveedor ? 'Actualizar' : 'Crear Proveedor'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
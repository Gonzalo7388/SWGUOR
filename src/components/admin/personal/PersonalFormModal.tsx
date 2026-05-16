'use client';

import { useState } from 'react';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { PersonalRow } from '@/lib/services/personal-interno.service';
import type { Cargo, Rol } from '@prisma/client';

const CARGOS: { value: Cargo; label: string }[] = [
  { value: 'gerente', label: 'Gerente' },
  { value: 'administrador', label: 'Administrador' },
  { value: 'disenador', label: 'Diseñador' },
  { value: 'cortador', label: 'Cortador' },
  { value: 'representante_taller', label: 'Rep. de Taller' },
  { value: 'recepcionista', label: 'Recepcionista' },
  { value: 'ayudante', label: 'Ayudante' },
];

const ROLES_INTERNOS: { value: Rol; label: string; descripcion: string }[] = [
  { value: 'gerente', label: 'Gerente', descripcion: 'Acceso total al ecosistema GUOR' },
  { value: 'administrador', label: 'Administrador', descripcion: 'Gestión completa de operaciones' },
  { value: 'recepcionista', label: 'Recepcionista', descripcion: 'Atención, ventas y terminal POS' },
  { value: 'disenador', label: 'Diseñador', descripcion: 'Catálogo, ingeniería y producción' },
  { value: 'cortador', label: 'Cortador', descripcion: 'Control de producción e insumos' },
  { value: 'representante_taller', label: 'Rep. de Taller', descripcion: 'Manufactura y flujo de despachos' },
  { value: 'ayudante', label: 'Ayudante', descripcion: 'Logística y soporte operativo' },
];

interface FormState {
  nombre_completo: string;
  cargo: string;
  dni: string;
  telefono: string;
  fecha_ingreso: string;
  // Solo creación:
  email: string;
  password: string;
  rol: string;
}

interface Props {
  personal: PersonalRow | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PersonalFormModal({ personal, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<FormState>({
    nombre_completo: personal?.nombre_completo ?? '',
    cargo: personal?.cargo ?? '',
    dni: personal?.dni ?? '',
    telefono: personal?.telefono ?? '',
    fecha_ingreso: personal?.fecha_ingreso ? new Date(personal.fecha_ingreso).toISOString().split('T')[0] : '',
    email: '',
    password: '',
    rol: '',
  });

  const handleChange = (field: keyof FormState, value: string) => {
    let finalValue = value;
    if (field === 'nombre_completo') {
      finalValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    }
    if (field === 'dni' || field === 'telefono') {
      finalValue = value.replace(/\D/g, '');
    }
    setForm((prev) => ({ ...prev, [field]: finalValue }));
    setErrors((prev) => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    const newErrors: Record<string, string> = {};
    if (!form.nombre_completo.trim()) newErrors.nombre_completo = 'Requerido';
    if (!form.cargo) newErrors.cargo = 'Requerido';
    if (form.dni && form.dni.length !== 8) newErrors.dni = 'Debe tener 8 dígitos';
    
    if (!personal) {
      if (!form.email.trim()) newErrors.email = 'Requerido';
      if (!form.password) newErrors.password = 'Requerido';
      else if (form.password.length < 8) newErrors.password = 'Mínimo 8 caracteres';
      if (!form.rol) newErrors.rol = 'Requerido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      if (personal) {
        // Edit
        const res = await fetch(`/api/admin/personal/${personal.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre_completo: form.nombre_completo.trim(),
            cargo: form.cargo || undefined,
            dni: form.dni ? Number(form.dni) : undefined,
            telefono: form.telefono ? Number(form.telefono) : undefined,
            fecha_ingreso: form.fecha_ingreso || undefined,
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.error ?? 'Error al actualizar');
        toast.success('Perfil actualizado correctamente');
      } else {
        // Create
        const res = await fetch('/api/admin/personal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email.trim().toLowerCase(),
            password: form.password,
            rol: form.rol,
            nombre_completo: form.nombre_completo.trim(),
            cargo: form.cargo,
            ...(form.dni && { dni: Number(form.dni) }),
            ...(form.telefono && { telefono: Number(form.telefono) }),
            ...(form.fecha_ingreso && { fecha_ingreso: form.fecha_ingreso }),
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.message ?? 'Error al crear el personal');
        toast.success('Perfil corporativo generado correctamente');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {personal ? 'Editar Colaborador' : 'Nuevo Colaborador'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {personal ? 'Actualiza los datos de identidad corporativa' : 'Registra un nuevo talento y sus credenciales'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Identidad y Contratación</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre Completo *</label>
                <Input
                  value={form.nombre_completo}
                  onChange={(e) => handleChange('nombre_completo', e.target.value)}
                  placeholder="Ej. Carlos Mamani"
                  className={errors.nombre_completo ? 'border-red-400' : ''}
                />
                {errors.nombre_completo && <p className="text-xs text-red-500 mt-1">{errors.nombre_completo}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">DNI *</label>
                <Input
                  value={form.dni}
                  onChange={(e) => handleChange('dni', e.target.value)}
                  placeholder="8 dígitos"
                  maxLength={8}
                  className={errors.dni ? 'border-red-400' : ''}
                />
                {errors.dni && <p className="text-xs text-red-500 mt-1">{errors.dni}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Teléfono</label>
                <Input
                  value={form.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  placeholder="Número de celular"
                  maxLength={12}
                  className={errors.telefono ? 'border-red-400' : ''}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cargo *</label>
                <select
                  value={form.cargo}
                  onChange={(e) => handleChange('cargo', e.target.value)}
                  className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.cargo ? 'border-red-400' : 'border-gray-200'
                  }`}
                >
                  <option value="">Seleccionar...</option>
                  {CARGOS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                {errors.cargo && <p className="text-xs text-red-500 mt-1">{errors.cargo}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fecha de Ingreso</label>
                <Input
                  type="date"
                  value={form.fecha_ingreso}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleChange('fecha_ingreso', e.target.value)}
                  className={errors.fecha_ingreso ? 'border-red-400' : ''}
                />
              </div>
            </div>
          </div>

          {!personal && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Credenciales de Acceso</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Correo Corporativo *</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="usuario@guor.com"
                    className={errors.email ? 'border-red-400' : ''}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Clave de Seguridad *</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className={errors.password ? 'border-red-400 pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Rol Administrativo *</label>
                  <select
                    value={form.rol}
                    onChange={(e) => handleChange('rol', e.target.value)}
                    className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.rol ? 'border-red-400' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Seleccionar rol...</option>
                    {ROLES_INTERNOS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  {errors.rol && <p className="text-xs text-red-500 mt-1">{errors.rol}</p>}
                </div>
              </div>
            </div>
          )}

          {personal && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex gap-2">
              <span className="text-amber-500 mt-0.5">⚠️</span>
              <p className="text-xs text-amber-700">
                La suspensión de acceso o cambio de rol/contraseña se gestionan desde el panel de Seguridad.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 h-11 bg-teal-600 hover:bg-teal-700 text-white" disabled={loading}>
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Guardando...</>
                : personal ? 'Actualizar Perfil' : 'Generar Perfil'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import type { Rol, usuarios } from '@prisma/client';

const ROLES: { value: Rol; label: string }[] = [
  { value: 'gerente', label: 'Gerente General' },
  { value: 'administrador', label: 'Administrador' },
  { value: 'recepcionista', label: 'Recepcionista' },
  { value: 'disenador', label: 'Diseñador' },
  { value: 'cortador', label: 'Cortador' },
  { value: 'ayudante', label: 'Ayudante' },
  { value: 'representante_taller', label: 'Representante de Taller' },
  { value: 'cliente', label: 'Cliente' },
];

interface FormState {
  email: string;
  password?: string;
  rol: string;
}

interface Props {
  usuario: usuarios | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UsuarioFormModal({ usuario, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [puedeEditarEmail, setPuedeEditarEmail] = useState(false);

  const [form, setForm] = useState<FormState>({
    email: usuario?.email ?? '',
    password: '',
    rol: usuario?.rol ?? '',
  });

  useEffect(() => {
    if (usuario) {
      const fetchRolActual = async () => {
        const supabase = getSupabaseBrowserClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return;

        const { data, error } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('auth_id', user.id)
          .single();

        if (!error && data?.rol === 'administrador') {
          setPuedeEditarEmail(true);
        }
      };
      fetchRolActual();
    } else {
      // In create mode, they can edit email.
      setPuedeEditarEmail(true);
    }
  }, [usuario]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!form.email.trim() && puedeEditarEmail) newErrors.email = 'Requerido';
    if (!form.rol) newErrors.rol = 'Requerido';
    
    if (!usuario) {
      if (!form.password) newErrors.password = 'Requerido';
      else if (form.password.length < 8) newErrors.password = 'Mínimo 8 caracteres';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      if (usuario) {
        // Edit
        const payloadUsuario: Record<string, unknown> = {
          id: usuario.id,
          rol: form.rol,
        };
        if (puedeEditarEmail) {
          payloadUsuario.email = form.email.trim();
        }

        const res = await fetch('/api/admin/usuarios', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadUsuario),
        });
        if (!res.ok) throw new Error('Error actualizando usuario');
        toast.success('Perfil sincronizado: Los privilegios han sido actualizados');
      } else {
        // Create
        const res = await fetch('/api/admin/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email.trim(), password: form.password, rol: form.rol }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.message ?? 'Error al crear usuario');
        toast.success('Credenciales generadas: Usuario registrado en el sistema');
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {usuario ? 'Editar Privilegios' : 'Nuevo Usuario'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {usuario ? 'Actualiza los niveles de acceso del usuario' : 'Genera nuevas credenciales para el sistema'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Identificador de Acceso (Email) *</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={!puedeEditarEmail}
                placeholder="ejemplo@guor.com"
                className={`
                  ${errors.email ? 'border-red-400' : ''}
                  ${!puedeEditarEmail ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
                `}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              {!puedeEditarEmail && usuario && (
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                  Solo administradores pueden editar este campo
                </p>
              )}
            </div>

            {!usuario && (
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
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Privilegios y Permisos *</label>
              <select
                value={form.rol}
                onChange={(e) => handleChange('rol', e.target.value)}
                className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                  errors.rol ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                <option value="">Seleccionar nivel de acceso...</option>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              {errors.rol && <p className="text-xs text-red-500 mt-1">{errors.rol}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 h-11 bg-pink-600 hover:bg-pink-700 text-white" disabled={loading}>
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Guardando...</>
                : usuario ? 'Actualizar Privilegios' : 'Registrar Credenciales'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

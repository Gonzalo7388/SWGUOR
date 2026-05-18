'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Loader2, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
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
  { value: 'almacenero', label: 'Almacenero' },
];

// ─── Password strength helpers ────────────────────────────────────────────────

interface PasswordChecks {
  length: boolean;      // ≥ 8 characters
  uppercase: boolean;   // at least one A-Z
  lowercase: boolean;   // at least one a-z
  number: boolean;      // at least one 0-9
  symbol: boolean;      // at least one special char
}

function getPasswordChecks(password: string): PasswordChecks {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

type StrengthLevel = 'empty' | 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong';

interface StrengthInfo {
  level: StrengthLevel;
  score: number;          // 0-5
  label: string;
  segmentColor: string;   // Tailwind bg class applied to filled segments
  textColor: string;      // Tailwind text class for the label
  filledSegments: number; // how many of 5 bar segments to fill
}

function getStrengthInfo(password: string, checks: PasswordChecks): StrengthInfo {
  if (!password) {
    return { level: 'empty', score: 0, label: '', segmentColor: 'bg-gray-200', textColor: 'text-gray-400', filledSegments: 0 };
  }

  const score = Object.values(checks).filter(Boolean).length; // 0-5

  switch (score) {
    case 1:
      return { level: 'very-weak', score, label: 'Muy débil', segmentColor: 'bg-red-600', textColor: 'text-red-600', filledSegments: 1 };
    case 2:
      return { level: 'weak', score, label: 'Débil', segmentColor: 'bg-orange-500', textColor: 'text-orange-500', filledSegments: 2 };
    case 3:
      return { level: 'medium', score, label: 'Intermedio', segmentColor: 'bg-amber-400', textColor: 'text-amber-500', filledSegments: 3 };
    case 4:
      return { level: 'strong', score, label: 'Fuerte', segmentColor: 'bg-lime-500', textColor: 'text-lime-600', filledSegments: 4 };
    case 5:
      return { level: 'very-strong', score, label: 'Muy fuerte', segmentColor: 'bg-green-500', textColor: 'text-green-600', filledSegments: 5 };
    default: // score === 0
      return { level: 'very-weak', score, label: 'Muy débil', segmentColor: 'bg-red-600', textColor: 'text-red-600', filledSegments: 1 };
  }
}

// ─── Requirement row sub-component ────────────────────────────────────────────

function RequirementRow({ met, label }: { met: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors duration-200 ${met ? 'text-green-600' : 'text-gray-400'}`}>
      {met
        ? <Check className="w-3 h-3 text-green-500 shrink-0" />
        : <AlertCircle className="w-3 h-3 text-gray-300 shrink-0" />
      }
      {label}
    </span>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

export default function UsuarioFormModal({ usuario, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [puedeEditarEmail, setPuedeEditarEmail] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [form, setForm] = useState<FormState>({
    email: usuario?.email ?? '',
    password: '',
    rol: usuario?.rol ?? '',
  });

  // Derived password analysis (only relevant in create mode)
  const passwordChecks = useMemo(() => getPasswordChecks(form.password ?? ''), [form.password]);
  const strengthInfo = useMemo(() => getStrengthInfo(form.password ?? '', passwordChecks), [form.password, passwordChecks]);

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
      setPuedeEditarEmail(true);
    }
  }, [usuario]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const copy = { ...prev }; delete copy[field]; return copy; });
    if (field === 'password') setPasswordTouched(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!form.email.trim() && puedeEditarEmail) newErrors.email = 'Requerido';
    if (!form.rol) newErrors.rol = 'Requerido';

    if (!usuario) {
      if (!form.password) {
        newErrors.password = 'Requerido';
      } else {
        const checks = getPasswordChecks(form.password);
        if (!checks.length) newErrors.password = 'Mínimo 8 caracteres';
        else if (!checks.uppercase) newErrors.password = 'Debe incluir al menos una mayúscula';
        else if (!checks.lowercase) newErrors.password = 'Debe incluir al menos una minúscula';
        else if (!checks.number) newErrors.password = 'Debe incluir al menos un número';
        else if (!checks.symbol) newErrors.password = 'Debe incluir al menos un símbolo (ej: @, #, !)';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setPasswordTouched(true);
      return;
    }

    setLoading(true);
    try {
      if (usuario) {
        const payloadUsuario: Record<string, unknown> = { id: usuario.id, rol: form.rol };
        if (puedeEditarEmail) payloadUsuario.email = form.email.trim();

        const res = await fetch('/api/admin/usuarios', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadUsuario),
        });
        if (!res.ok) throw new Error('Error actualizando usuario');
        toast.success('Perfil sincronizado: Los privilegios han sido actualizados');
      } else {
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
              {usuario
                ? 'Actualiza los niveles de acceso del usuario'
                : 'Genera nuevas credenciales para el sistema'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Identificador de Acceso (Email) *
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={!puedeEditarEmail}
                placeholder="ejemplo@guor.com"
                className={[
                  errors.email ? 'border-red-400' : '',
                  !puedeEditarEmail ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : '',
                ].join(' ')}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              {!puedeEditarEmail && usuario && (
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                  Solo administradores pueden editar este campo
                </p>
              )}
            </div>

            {/* Password — only in create mode */}
            {!usuario && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Clave de Seguridad *
                </label>

                {/* Input */}
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

                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}

                {/* Strength bar — visible once the user starts typing */}
                {passwordTouched && (form.password ?? '').length > 0 && (
                  <div className="space-y-2 pt-1">
                    {/* Five-segment bar */}
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((seg) => (
                        <div
                          key={seg}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${seg <= strengthInfo.filledSegments
                              ? strengthInfo.segmentColor
                              : 'bg-gray-200'
                            }`}
                        />
                      ))}
                      <span className={`text-[11px] font-semibold ml-1 w-20 ${strengthInfo.textColor}`}>
                        {strengthInfo.label}
                      </span>
                    </div>

                    {/* Requirement checklist — 2-column grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-0.5">
                      <RequirementRow met={passwordChecks.length} label="Mínimo 8 caracteres" />
                      <RequirementRow met={passwordChecks.uppercase} label="Una mayúscula (A-Z)" />
                      <RequirementRow met={passwordChecks.lowercase} label="Una minúscula (a-z)" />
                      <RequirementRow met={passwordChecks.number} label="Un número (0-9)" />
                      <RequirementRow met={passwordChecks.symbol} label="Un símbolo (@, #, !…)" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Privilegios y Permisos *
              </label>
              <select
                value={form.rol}
                onChange={(e) => handleChange('rol', e.target.value)}
                className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.rol ? 'border-red-400' : 'border-gray-200'
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

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 bg-pink-600 hover:bg-pink-700 text-white"
              disabled={loading}
            >
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
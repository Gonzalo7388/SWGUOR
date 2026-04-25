"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button }        from "@/components/ui/button";
import { Input }         from "@/components/ui/input";
import { Label }         from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast }         from "sonner";
import { UserCog, ShieldCheck, Mail } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Rol, usuarios } from "@prisma/client";

const ROLES_SISTEMA: { value: Rol; label: string }[] = [
  { value: "gerente",              label: "Gerente General"         },
  { value: "administrador",        label: "Administrador"           },
  { value: "recepcionista",        label: "Recepcionista"           },
  { value: "disenador",            label: "Diseñador"               },
  { value: "cortador",             label: "Cortador"                },
  { value: "ayudante",             label: "Ayudante"                },
  { value: "representante_taller", label: "Representante de Taller" },
  { value: "cliente",              label: "Cliente"                 },
];

interface EditUsuarioDialogProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
  usuario:   usuarios;
}

export default function EditUsuarioDialog({
  isOpen, onClose, onSuccess, usuario,
}: EditUsuarioDialogProps) {
  const [loading,         setLoading]         = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol | null>(usuario?.rol ?? null);
  const [rolActual,       setRolActual]       = useState<Rol | null>(null);

  const puedeEditarEmail = rolActual === 'administrador';

  useEffect(() => {
    if (!isOpen) return;

    const fetchRolActual = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return;

      const { data, error } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('auth_id', user.id)
        .single();

      if (!error && data?.rol) setRolActual(data.rol as Rol);
    };

    fetchRolActual();
  }, [isOpen]);

  useEffect(() => {
    if (usuario) setRolSeleccionado(usuario.rol ?? null);
  }, [usuario]);

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // Payload para PATCH /api/admin/usuarios — solo campos que existen en usuarios
    const payloadUsuario: Record<string, unknown> = {
      id:  usuario.id,
      rol: rolSeleccionado,
    };
    if (puedeEditarEmail) {
      payloadUsuario.email = formData.get('email') as string;
    }

    try {
      const resUsuario = await fetch("/api/admin/usuarios", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payloadUsuario),
      });
      if (!resUsuario.ok) throw new Error('Error actualizando usuario');

      toast.success("Perfil actualizado con éxito");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "No se pudieron guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] border-none shadow-2xl bg-white p-0 overflow-hidden">
        <div className="h-2 bg-pink-600 w-full" />

        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-50 rounded-lg">
                <UserCog className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-800 uppercase tracking-tight">
                  Configuración de Usuario
                </DialogTitle>
                <DialogDescription className="text-slate-500">
                  Modifica los accesos y datos personales del personal.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Correo Electrónico
                {puedeEditarEmail && (
                  <span className="text-pink-600 text-[10px] font-black">· Editable</span>
                )}
              </Label>
              <Input
                name="email"
                type="email"
                defaultValue={usuario?.email}
                disabled={!puedeEditarEmail}
                placeholder="correo@empresa.com"
                className={
                  puedeEditarEmail
                    ? "bg-slate-50 border-slate-200 focus:bg-white transition-all h-11"
                    : "bg-slate-100 border-dashed text-slate-400 cursor-not-allowed h-11"
                }
              />
              {!puedeEditarEmail && (
                <p className="text-[10px] text-slate-400 italic">
                  · Solo el rol <span className="font-bold text-slate-500">Administrador</span> puede editar el correo
                </p>
              )}
            </div>

            {/* Rol */}
            <div className="space-y-2">
              <Label className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Nivel de Acceso (Rol)
              </Label>
              <Select
                value={rolSeleccionado ?? ''}
                onValueChange={(value) => setRolSeleccionado(value as Rol)}
              >
                <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Seleccione un cargo" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {ROLES_SISTEMA.map((rol) => (
                    <SelectItem key={rol.value} value={rol.value} className="py-2">
                      <span className="font-medium text-slate-700">{rol.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-400 italic">
                · El rol determina los módulos a los que el usuario puede acceder.
              </p>
            </div>

            <DialogFooter className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
              <Button type="button" variant="ghost" onClick={onClose} className="text-slate-500 hover:bg-slate-100">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-200 px-8 transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando
                  </span>
                ) : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { RolUsuario } from "@/types";

const ROLES_SISTEMA: { value: RolUsuario; label: string }[] = [
  { value: "administrador", label: "Administrador" },
  { value: "recepcionista", label: "Recepcionista" },
  { value: "diseñador", label: "Diseñador" },
  { value: "cortador", label: "Cortador" },
  { value: "ayudante", label: "Ayudante" },
  { value: "representante_taller", label: "Representante de Taller" },
];

export default function EditUsuarioDialog({ isOpen, onClose, onSuccess, usuario }: any) {
  const [loading, setLoading] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState<RolUsuario>(usuario?.rol);

  useEffect(() => {
      if (usuario) {
        setRolSeleccionado(usuario.rol);
      }
    }, [usuario]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = { ...Object.fromEntries(formData), id: usuario.id };

    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Usuario actualizado correctamente");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold uppercase text-slate-900">Editar Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nombre Completo</Label>
            <Input name="nombre_completo" defaultValue={usuario?.nombre_completo} required />
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select value={rolSeleccionado} onValueChange={(value) => setRolSeleccionado(value as RolUsuario)} name="rol" required>
              <SelectTrigger id="rol">
                <SelectValue placeholder="Seleccione un rol" />
              </SelectTrigger>
              <SelectContent>
                {ROLES_SISTEMA.map((rol) => (
                  <SelectItem key={rol.value} value={rol.value}>
                    {rol.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-pink-600">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
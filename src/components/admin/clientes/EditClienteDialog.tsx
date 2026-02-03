"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Edit3 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function EditClienteDialog({ isOpen, onClose, cliente, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(cliente?.activo || "activo");

  useEffect(() => {
    if (cliente?.activo) setStatus(cliente.activo);
  }, [cliente, isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const supabase = getSupabaseBrowserClient();
    
    const updatedData = {
      razon_social: formData.get("razon_social"),
      ruc: formData.get("ruc"),
      telefono: formData.get("telefono"),
      email: formData.get("email"),
      direccion: formData.get("direccion"),
      activo: status,
    };

    try {
      const { error } = await (supabase.from("clientes") as any)
        .update(updatedData)
        .eq("id", cliente.id);

      if (error) throw error;
      toast.success("Cambios guardados");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* max-w-lg y rounded-[2rem] para imitar el diálogo de Inventario */}
      <DialogContent className="max-w-lg rounded-[2.5rem] p-10 border-none shadow-2xl overflow-hidden">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
              <Edit3 size={20} strokeWidth={3} />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-800">
              Editar Cliente
            </DialogTitle>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Solo los campos de información comercial son editables.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          {/* Razón Social */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-tighter text-slate-400 ml-1">Nombre Comercial</Label>
            <Input 
              name="razon_social" 
              defaultValue={cliente?.razon_social}
              className="h-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white px-4 font-bold text-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-tighter text-slate-400 ml-1">DNI / RUC</Label>
              <Input
                name="ruc"
                defaultValue={cliente?.ruc}
                className="h-11 rounded-xl border-slate-100 bg-slate-50/50 font-bold text-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-tighter text-slate-400 ml-1">Teléfono</Label>
              <Input
                name="telefono"
                defaultValue={cliente?.telefono}
                className="h-11 rounded-xl border-slate-100 bg-slate-50/50 font-bold text-slate-700"
              />
            </div>
          </div>

          {/* Estado de Cuenta - Estilo Select idéntico a Inventario */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-tighter text-slate-400 ml-1">Estado de Cuenta</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-11 rounded-xl border-slate-100 bg-slate-50/50 font-bold text-slate-600">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                <SelectItem value="activo" className="font-bold py-2">Activo</SelectItem>
                <SelectItem value="inactivo" className="font-bold py-2">Inactivo</SelectItem>
                <SelectItem value="suspendido" className="font-bold py-2">Suspendido</SelectItem>
                <SelectItem value="potencial" className="font-bold py-2">Potencial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-tighter text-slate-400 ml-1">Correo Electrónico</Label>
            <Input
              name="email"
              type="email"
              defaultValue={cliente?.email}
              className="h-11 rounded-xl border-slate-100 bg-slate-50/50 font-bold text-slate-700"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-tighter text-slate-400 ml-1">Dirección</Label>
            <Input
              name="direccion"
              defaultValue={cliente?.direccion}
              className="h-11 rounded-xl border-slate-100 bg-slate-50/50 font-bold text-slate-700"
            />
          </div>

          <DialogFooter className="pt-6 flex flex-row items-center justify-center gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="text-[12px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Descartar
            </button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-pink-600 hover:bg-pink-700 text-white rounded-full h-11 px-10 font-black uppercase text-[11px] shadow-lg shadow-pink-200"
            >
              {loading ? "Sincronizando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
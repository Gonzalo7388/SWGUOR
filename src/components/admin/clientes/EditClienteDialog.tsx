"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
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
import { 
  Edit3, 
  Building2, 
  Fingerprint, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Loader2, 
  Save 
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

// Estilos constantes para coherencia visual del ERP
const ERP_LABEL = "text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-2 mb-1.5";
const ERP_INPUT = "bg-[#f1f5f9] border-none h-12 rounded-xl font-medium text-[#334155] focus-visible:ring-1 focus-visible:ring-pink-200 transition-all placeholder:text-slate-400";

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
      toast.success("Información de cliente actualizada");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Error al actualizar cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white rounded-[32px] overflow-hidden p-0 border-none shadow-2xl">
        
        {/* CABECERA */}
        <div className="p-8 flex items-center gap-4">
          <div className="p-3 bg-[#fff0f6] rounded-2xl">
            <Edit3 className="w-7 h-7 text-[#e32d6f]" />
          </div>
          <div>
            <DialogTitle className="text-xl font-extrabold text-[#1a2b4b] uppercase tracking-tight">
              Perfil del Cliente
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-[13px] font-medium">
              Modifica los datos comerciales y de contacto.
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          
          {/* RAZÓN SOCIAL */}
          <div className="space-y-1">
            <Label className={ERP_LABEL}>
              <Building2 className="w-3.5 h-3.5" /> Razón Social / Nombre Comercial
            </Label>
            <Input 
              name="razon_social" 
              defaultValue={cliente?.razon_social}
              className={ERP_INPUT}
              placeholder="Ej. Corporación Textil S.A.C."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* RUC / DNI */}
            <div className="space-y-1">
              <Label className={ERP_LABEL}>
                <Fingerprint className="w-3.5 h-3.5" /> Identificación (RUC/DNI)
              </Label>
              <Input
                name="ruc"
                defaultValue={cliente?.ruc}
                className={ERP_INPUT}
              />
            </div>
            {/* TELÉFONO */}
            <div className="space-y-1">
              <Label className={ERP_LABEL}>
                <Phone className="w-3.5 h-3.5" /> Teléfono de Contacto
              </Label>
              <Input
                name="telefono"
                defaultValue={cliente?.telefono}
                className={ERP_INPUT}
              />
            </div>
          </div>

          {/* ESTADO Y EMAIL */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className={ERP_LABEL}>
                <ShieldCheck className="w-3.5 h-3.5" /> Estado Comercial
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className={ERP_INPUT}>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                  <SelectItem value="activo" className="font-bold py-2 text-green-600">Activo</SelectItem>
                  <SelectItem value="inactivo" className="font-bold py-2 text-slate-400">Inactivo</SelectItem>
                  <SelectItem value="suspendido" className="font-bold py-2 text-red-600">Suspendido</SelectItem>
                  <SelectItem value="potencial" className="font-bold py-2 text-blue-600">Potencial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className={ERP_LABEL}>
                <Mail className="w-3.5 h-3.5" /> Email
              </Label>
              <Input
                name="email"
                type="email"
                defaultValue={cliente?.email}
                className={ERP_INPUT}
              />
            </div>
          </div>

          {/* DIRECCIÓN */}
          <div className="space-y-1">
            <Label className={ERP_LABEL}>
              <MapPin className="w-3.5 h-3.5" /> Dirección Fiscal / Entrega
            </Label>
            <Input
              name="direccion"
              defaultValue={cliente?.direccion}
              className={ERP_INPUT}
            />
          </div>

          {/* ACCIONES FOOTER */}
          <div className="flex items-center justify-end gap-6 pt-6 border-t border-slate-50">
            <button 
              type="button" 
              onClick={onClose} 
              className="text-[#64748b] font-bold text-sm hover:text-slate-800 transition-colors"
            >
              Descartar
            </button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-[#e32d6f] hover:bg-[#c4235d] h-12 px-10 rounded-xl font-bold text-white shadow-lg shadow-pink-100 transition-all active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>Actualizar Cliente</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
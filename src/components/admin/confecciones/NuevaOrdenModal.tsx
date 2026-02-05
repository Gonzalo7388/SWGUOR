"use client";

import { useForm } from 'react-hook-form';
import { Send, Factory, Ruler, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ESTADOS_CONFECCION } from '@/lib/constants/estados';

interface NuevaOrdenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NuevaOrdenModal = ({ isOpen, onClose, onSuccess }: NuevaOrdenModalProps) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/admin/confecciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess();
        reset();
        onClose();
      }
    } catch (error) {
      console.error("Error al crear orden:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-125 rounded-[3rem] border-none p-8 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-slate-900 italic">
            Nueva Orden de Producción
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">
            Asignación de trabajo a talleres externos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Cliente y Prenda */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Cliente</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  {...register("cliente", { required: true })}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                  placeholder="Nombre del cliente"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Prenda / Modelo</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  {...register("prenda", { required: true })}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                  placeholder="Ej: Polo Jersey"
                />
              </div>
            </div>
          </div>

          {/* Cantidad y Taller */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Cantidad</label>
              <input
                type="number"
                {...register("cantidad", { required: true, min: 1 })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Taller Asignado</label>
              <div className="relative">
                <Factory className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <select
                  {...register("taller", { required: true })}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all appearance-none"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Taller A">Taller A</option>
                  <option value="Taller B">Taller B</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fecha de Entrega y Estado Inicial */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Fecha Límite</label>
              <input
                type="date"
                {...register("fechaFin", { required: true })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Estado Inicial</label>
              <select
                {...register("estado")}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all appearance-none"
              >
                {Object.entries(ESTADOS_CONFECCION).map(([key, info]) => (
                  <option key={key} value={key}>{info.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-2xl font-black uppercase text-[10px] tracking-widest border-slate-200"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-slate-200"
            >
              {isSubmitting ? "Creando..." : <><Send size={14} /> Crear Orden</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
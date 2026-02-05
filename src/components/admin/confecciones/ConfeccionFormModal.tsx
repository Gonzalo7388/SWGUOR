"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Send, Factory, Ruler, User, Paperclip } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ESTADOS_CONFECCION } from '@/lib/constants/estados';
import { useTalleres } from '@/lib/hooks/useTalleres';

interface ConfeccionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  confeccion?: any; // Si viene, es edición
}

export const ConfeccionFormModal = ({ isOpen, onClose, onSuccess, confeccion }: ConfeccionFormProps) => {
  const { talleres } = useTalleres();
  const isEdit = !!confeccion;
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm();

  // Resetear o cargar datos cuando cambia el modo
  useEffect(() => {
    if (isEdit && confeccion) {
      Object.keys(confeccion).forEach(key => setValue(key, confeccion[key]));
    } else {
      reset();
    }
  }, [confeccion, isEdit, setValue, reset]);

  const onSubmit = async (data: any) => {
    try {
      const url = isEdit ? `/api/admin/confecciones/${confeccion.id}` : '/api/admin/confecciones';
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error en la operación:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-125 rounded-[3rem] border-none p-8 shadow-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-slate-900 italic">
            {isEdit ? 'Editar Producción' : 'Nueva Orden'}
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">
            {isEdit ? 'Modificar datos de la orden activa' : 'Asignación de trabajo a talleres'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Cliente</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input {...register("cliente")} className="form-input-custom" placeholder="Cliente" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Prenda</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input {...register("prenda")} className="form-input-custom" placeholder="Modelo" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Taller</label>
              <select {...register("taller_id", { required: true })} 
                className="form-input-custom appearance-none pl-10"
              >
                <option value="">Seleccione un taller...</option>
                {talleres.map((t) => (
                    <option key={t.id} value={t.id}>
                    {t.nombre}
                    </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Estado</label>
              <select {...register("estado")} className="form-input-custom appearance-none">
                {Object.entries(ESTADOS_CONFECCION).map(([key, info]) => (
                  <option key={key} value={key}>{info.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* CAMPO DE FICHA TÉCNICA (URL o Archivo) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Patrón / Ficha Técnica (URL)</label>
            <div className="relative">
              <Paperclip className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input {...register("ficha_url")} className="form-input-custom" placeholder="https://supabase-storage.com/..." />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="btn-secondary">
              Cerrar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? "Procesando..." : isEdit ? "Guardar Cambios" : "Crear Orden"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
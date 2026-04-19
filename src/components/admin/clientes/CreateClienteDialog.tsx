'use client';

import React, { useState, useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Building2, User, MapPin, Mail, Phone, ShieldCheck, Globe } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  createClienteSchema,
  type CreateClienteInput,
} from '@/lib/schemas/clientes';
import { createCliente } from '@/app/admin/Panel-Administrativo/clientes/actions';

// Estilo de etiquetas basado en la imagen
const ERP_LABEL = "text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-2 mb-1.5";
// Estilo de inputs basado en la imagen
const ERP_INPUT = "bg-[#f1f5f9] border-none h-12 rounded-xl font-medium text-[#334155] focus-visible:ring-1 focus-visible:ring-pink-200 transition-all";

interface CreateClienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newCliente: { id: number; razon_social: string | null; ruc: string }) => void;
}

export function CreateClienteDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateClienteDialogProps) {
  const formId = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mostrarDireccion, setMostrarDireccion] = useState(false);

  const form = useForm<CreateClienteInput>({
    resolver: zodResolver(createClienteSchema) as any,
    defaultValues: {
      ruc: '',
      razon_social: '',
      nombre_comercial: '',
      email: '',
      telefono: '',
      direccion_fiscal: '',
      tipo_cliente: 'corporativo',
      activo: 'activo',
      direccion_alias: '',
      direccion_direccion: '',
      direccion_ciudad: '',
      direccion_departamento: '',
    },
  });

  const rucValue = form.watch('ruc');

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      setMostrarDireccion(false);
    }
    onOpenChange(isOpen);
  };

  const onSubmit = async (data: CreateClienteInput) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...data,
        crear_direccion: mostrarDireccion,
        direccion: mostrarDireccion ? {
          alias:        data.direccion_alias        || 'Principal',
          direccion:    data.direccion_direccion    || '',
          ciudad:       data.direccion_ciudad,
          departamento: data.direccion_departamento,
        } : undefined,
      };

      const result = await createCliente(payload);

      if (!result.success) {
        toast.error(result.error ?? 'Error al crear el cliente');
        return;
      }

      toast.success(`Cliente ${result.data?.razon_social ?? result.data?.ruc} creado`);
      onSuccess(result.data!);
      handleOpenChange(false);
    } catch {
      toast.error('Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg bg-white rounded-[32px] overflow-hidden p-0 border-none shadow-2xl">
        
        {/* HEADER ESTILO "CONFIGURACIÓN DE USUARIO" */}
        <div className="p-8 pb-4 flex items-center gap-4">
          <div className="p-3 bg-[#fff0f6] rounded-2xl">
            <User className="w-7 h-7 text-[#e32d6f]" />
          </div>
          <div>
            <DialogTitle className="text-xl font-extrabold text-[#1a2b4b] uppercase tracking-tight">
              Perfil del Cliente
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-[13px] font-medium">
              Registra los datos fiscales y de contacto del nuevo cliente.
            </DialogDescription>
          </div>
        </div>

        <Form {...form}>
          <form
            id={`${formId}-cliente-form`}
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-8 pb-8 space-y-5"
          >
            {/* RUC Y RAZÓN SOCIAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ruc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={ERP_LABEL}><ShieldCheck className="w-3.5 h-3.5" /> RUC / DNI *</FormLabel>
                    <FormControl>
                      <Input {...field} className={ERP_INPUT} placeholder="10XXXXXXXXX" maxLength={11} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="razon_social"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={ERP_LABEL}><Building2 className="w-3.5 h-3.5" /> Razón Social *</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} className={ERP_INPUT} placeholder="Empresa S.A.C" />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* EMAIL Y TELÉFONO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={ERP_LABEL}><Mail className="w-3.5 h-3.5" /> Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} value={field.value || ''} className={ERP_INPUT} placeholder="cliente@correo.com" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={ERP_LABEL}><Phone className="w-3.5 h-3.5" /> Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} className={ERP_INPUT} placeholder="999 999 999" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* TIPO DE CLIENTE Y ESTADO */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo_cliente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={ERP_LABEL}><Globe className="w-3.5 h-3.5" /> Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'corporativo'}>
                      <FormControl>
                        <SelectTrigger className={ERP_INPUT}>
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-slate-100">
                        <SelectItem value="corporativo">Corporativo</SelectItem>
                        <SelectItem value="minorista">Minorista</SelectItem>
                        <SelectItem value="distribuidor">Distribuidor</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={ERP_LABEL}>Estado del Registro</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'activo'}>
                      <FormControl>
                        <SelectTrigger className={ERP_INPUT}>
                          <SelectValue placeholder="Estado..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-slate-100">
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="inactivo">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* DIRECCIÓN FISCAL */}
            <FormField
              control={form.control}
              name="direccion_fiscal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={ERP_LABEL}><MapPin className="w-3.5 h-3.5" /> Dirección Fiscal Principal</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} className={ERP_INPUT} placeholder="Av. Los Fundadores 123..." />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* ACCIONES FOOTER */}
            <div className="flex items-center justify-end gap-6 pt-6 mt-4 border-t border-slate-50">
              <DialogClose asChild>
                <button
                  type="button"
                  className="text-[#64748b] font-bold text-sm hover:text-slate-800 transition-colors"
                >
                  Cancelar
                </button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#e32d6f] hover:bg-[#c4235d] h-12 px-10 rounded-xl font-bold text-white shadow-lg shadow-pink-100 transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Guardar Cliente"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
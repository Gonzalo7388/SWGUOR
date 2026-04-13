'use client';

import React, { useState, useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Building2, User, MapPin } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
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

interface CreateClienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newCliente: { id: number; razon_social: string | null; ruc: string }) => void;
}

const ERP_LABEL = 'text-[10px] font-black text-slate-500 uppercase tracking-wider';

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
  const esPersonaJuridica = rucValue?.startsWith('20');

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
      };

      const result = await createCliente(payload);

      if (!result.success) {
        toast.error(result.error ?? 'Error al crear el cliente');
        return;
      }

      toast.success(
        `Cliente ${result.data?.razon_social ?? result.data?.ruc} creado exitosamente`
      );
      onSuccess(result.data!);
      handleOpenChange(false);
    } catch {
      toast.error('Error inesperado al crear el cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase text-slate-900 flex items-center gap-2">
            <Building2 size={20} className="text-blue-600" />
            Nuevo Cliente
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-bold text-xs uppercase">
            Complete los datos del cliente. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id={`${formId}-cliente-form`}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-4"
          >
            {/* IDENTIFICACIÓN */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {esPersonaJuridica ? (
                  <Building2 size={16} className="text-blue-600" />
                ) : (
                  <User size={16} className="text-emerald-600" />
                )}
                <h3 className="text-sm font-black uppercase text-slate-900">
                  Identificación
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ruc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>
                        RUC / DNI *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="h-10 border-slate-200 rounded-xl text-xs"
                          placeholder="Ingrese el RUC o DNI"
                          maxLength={11}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="razon_social"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>Nombre / Razón Social *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          className="h-10 border-slate-200 rounded-xl text-xs"
                          placeholder="Razón Social de la empresa o Nombre"
                          maxLength={255}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nombre_comercial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>Nombre Comercial</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          className="h-10 border-slate-200 rounded-xl text-xs"
                          placeholder="Nombre comercial (opcional)"
                          maxLength={255}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tipo_cliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>Tipo de Cliente</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'corporativo'}>
                        <FormControl>
                          <SelectTrigger className="h-10 border-slate-200 rounded-xl text-xs">
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* <-- Actualizado con los valores de la imagen --> */}
                          <SelectItem value="corporativo">Corporativo</SelectItem>
                          <SelectItem value="minorista">Minorista</SelectItem>
                          <SelectItem value="distribuidor">Distribuidor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* CONTACTO */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-900">
                Contacto
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          value={field.value || ''}
                          className="h-10 border-slate-200 rounded-xl text-xs"
                          placeholder="correo@ejemplo.com"
                          maxLength={150}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>Teléfono</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          className="h-10 border-slate-200 rounded-xl text-xs"
                          placeholder="999 999 999"
                          maxLength={50}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'activo'}>
                        <FormControl>
                          <SelectTrigger className="h-10 border-slate-200 rounded-xl text-xs">
                            <SelectValue placeholder="Estado..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="activo">Activo</SelectItem>
                          <SelectItem value="inactivo">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* DIRECCIÓN FISCAL */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-900">
                Dirección Fiscal
              </h3>
              
              <FormField
                control={form.control}
                name="direccion_fiscal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={ERP_LABEL}>Dirección Fiscal Principal</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        className="h-10 border-slate-200 rounded-xl text-xs"
                        placeholder="Av. Principal 123, Lima..."
                        maxLength={255}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="bg-slate-200" />

            {/* SUCURSAL / DIRECCIÓN ADICIONAL */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setMostrarDireccion(!mostrarDireccion)}
                className="flex items-center gap-2 text-sm font-black uppercase text-slate-700 hover:text-blue-600 transition-colors"
              >
                <MapPin size={16} />
                {mostrarDireccion ? 'Ocultar' : 'Agregar'} Sucursal / Dirección Adicional
              </button>

              {mostrarDireccion && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <FormField
                    control={form.control}
                    name="direccion_alias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={ERP_LABEL}>Alias *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            className="h-10 border-slate-200 rounded-xl text-xs"
                            placeholder="Almacén, Tienda 2..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="direccion_direccion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={ERP_LABEL}>Dirección de Sucursal *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            className="h-10 border-slate-200 rounded-xl text-xs"
                            placeholder="Av. Secundaria 456, Lima"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="direccion_ciudad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={ERP_LABEL}>Ciudad</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            className="h-10 border-slate-200 rounded-xl text-xs"
                            placeholder="Lima, Arequipa..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="direccion_departamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={ERP_LABEL}>Departamento</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            className="h-10 border-slate-200 rounded-xl text-xs"
                            placeholder="Lima, La Libertad..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </form>
        </Form>

        {/* BOTONES DE ACCIÓN */}
        <DialogFooter className="flex gap-3 sm:justify-end mt-6">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="h-11 font-bold uppercase rounded-xl"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form={`${formId}-cliente-form`}
            disabled={isSubmitting}
            className="h-11 bg-slate-900 hover:bg-slate-800 font-bold uppercase rounded-xl gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Plus size={16} />
                Guardar Cliente
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
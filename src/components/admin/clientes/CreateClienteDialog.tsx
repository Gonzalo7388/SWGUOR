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
import { createCliente } from './actions';

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
    resolver: zodResolver(createClienteSchema),
    defaultValues: {
      tipo_documento: 'RUC 20',
      ruc: '',
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      razon_social: '',
      nombre_comercial: '',
      email: '',
      telefono: '',
      direccion_fiscal: '',
      pais: 'Peru',
      estado_comercial: 'Activo',
      lista_precios: '',
      sector: 'General',
      sub_sector: 'General',
      categoria_cliente: 'General',
      codigo_cliente: '',
      moneda_defecto: 'Soles',
      forma_pago_defecto: '',
      metodo_comercial: '',
      tipo_pedido_defecto: '',
      impuesto_defecto: 'IGV',
      crear_direccion: false,
      direccion_alias: '',
      direccion_detalle: '',
      direccion_ciudad: '',
      direccion_departamento: '',
    },
  });

  const tipoDocumento = form.watch('tipo_documento');
  const esPersonaJuridica = tipoDocumento === 'RUC 20';
  const esPersonaNatural = tipoDocumento === 'DNI' || tipoDocumento === 'RUC 10';

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

      // Agregar flag de dirección si se mostró el campo
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
        `✅ Cliente ${result.data?.nombre_completo ?? result.data?.ruc} creado exitosamente`
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
            Complete los datos del cliente. Los campos marcados con * son obligatorios según el tipo de documento.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id={`${formId}-cliente-form`}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-4"
          >
            {/* ═══════════════════════════════════════
                IDENTIFICACIÓN
                ═══════════════════════════════════════ */}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tipo Documento */}
                <FormField
                  control={form.control}
                  name="tipo_documento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>Tipo Documento *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 border-slate-200 rounded-xl text-xs">
                            <SelectValue placeholder="Tipo..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="RUC 20">RUC 20 (Persona Jurídica)</SelectItem>
                          <SelectItem value="RUC 10">RUC 10 (Persona Natural)</SelectItem>
                          <SelectItem value="DNI">DNI</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* RUC/DNI */}
                <FormField
                  control={form.control}
                  name="ruc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>
                        {tipoDocumento} *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="h-10 border-slate-200 rounded-xl text-xs"
                          placeholder={
                            tipoDocumento === 'DNI'
                              ? '8 dígitos'
                              : tipoDocumento === 'RUC 10'
                              ? '10 dígitos'
                              : '11 dígitos'
                          }
                          maxLength={
                            tipoDocumento === 'DNI'
                              ? 8
                              : tipoDocumento === 'RUC 10'
                              ? 10
                              : 11
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Código Cliente */}
                <FormField
                  control={form.control}
                  name="codigo_cliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>Código Interno</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="h-10 border-slate-200 rounded-xl text-xs"
                          placeholder="Auto si vacío"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Campos condicionales: Persona Jurídica */}
              {esPersonaJuridica && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="razon_social"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={ERP_LABEL}>Razón Social *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-10 border-slate-200 rounded-xl text-xs"
                            placeholder="Razón Social de la empresa"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nombre_comercial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={ERP_LABEL}>Nombre Comercial</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-10 border-slate-200 rounded-xl text-xs"
                            placeholder="Nombre comercial (opcional)"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Campos condicionales: Persona Natural */}
              {esPersonaNatural && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={ERP_LABEL}>Nombre *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-10 border-slate-200 rounded-xl text-xs"
                            placeholder="Nombre"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apellido_paterno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={ERP_LABEL}>Apellido Paterno *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-10 border-slate-200 rounded-xl text-xs"
                            placeholder="Apellido Paterno"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apellido_materno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={ERP_LABEL}>Apellido Materno</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-10 border-slate-200 rounded-xl text-xs"
                            placeholder="Apellido Materno"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <Separator className="bg-slate-200" />

            {/* ═══════════════════════════════════════
                CONTACTO
                ═══════════════════════════════════════ */}
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
                          className="h-10 border-slate-200 rounded-xl text-xs"
                          placeholder="correo@ejemplo.com"
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
                          className="h-10 border-slate-200 rounded-xl text-xs"
                          placeholder="999 999 999"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estado_comercial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>Estado Comercial</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 border-slate-200 rounded-xl text-xs">
                            <SelectValue placeholder="Estado..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Activo">Activo</SelectItem>
                          <SelectItem value="Inactivo">Inactivo</SelectItem>
                          <SelectItem value="Prospecto">Prospecto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* ═══════════════════════════════════════
                CONFIGURACIÓN DE VENTAS
                ═══════════════════════════════════════ */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-900">
                Configuración de Ventas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="moneda_defecto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>Moneda Defecto</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 border-slate-200 rounded-xl text-xs">
                            <SelectValue placeholder="Moneda..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Soles">Soles (PEN)</SelectItem>
                          <SelectItem value="Dólares Americanos">Dólares (USD)</SelectItem>
                          <SelectItem value="Euros">Euros (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="forma_pago_defecto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>Forma Pago Defecto</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="h-10 border-slate-200 rounded-xl text-xs"
                          placeholder="Contado, Crédito 30 días..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="impuesto_defecto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>Impuesto Defecto</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 border-slate-200 rounded-xl text-xs">
                            <SelectValue placeholder="Impuesto..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="IGV">IGV (18%)</SelectItem>
                          <SelectItem value="EXONERADO">Exonerado</SelectItem>
                          <SelectItem value="GRATUITO">Gratuito</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="lista_precios"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>Lista Precios</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="h-10 border-slate-200 rounded-xl text-xs"
                          placeholder="GENERAL GEXIM, GENERAL FCM..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>Sector</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="h-10 border-slate-200 rounded-xl text-xs"
                          placeholder="Textil, Retail, etc."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoria_cliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>Categoría</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="h-10 border-slate-200 rounded-xl text-xs"
                          placeholder="Mayorista, Minorista..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* ═══════════════════════════════════════
                DIRECCIÓN PRINCIPAL (OPCIONAL)
                ═══════════════════════════════════════ */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setMostrarDireccion(!mostrarDireccion)}
                className="flex items-center gap-2 text-sm font-black uppercase text-slate-700 hover:text-blue-600 transition-colors"
              >
                <MapPin size={16} />
                {mostrarDireccion ? 'Ocultar' : 'Agregar'} Dirección Principal
              </button>

              {mostrarDireccion && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <FormField
                    control={form.control}
                    name="direccion_alias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={ERP_LABEL}>Alias</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-10 border-slate-200 rounded-xl text-xs"
                            placeholder="Principal, Oficina, Almacén..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="direccion_detalle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={ERP_LABEL}>Dirección *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-10 border-slate-200 rounded-xl text-xs"
                            placeholder="Av. Principal 123, Lima"
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

        {/* ═══════════════════════════════════════
            BOTONES DE ACCIÓN
            ═══════════════════════════════════════ */}
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
                Creando...
              </>
            ) : (
              <>
                <Plus size={16} />
                Crear Cliente
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

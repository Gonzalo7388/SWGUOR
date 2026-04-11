'use client';

import React, { useState, useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Building2, User, MapPin, Settings, Search, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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

interface CreateClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ERP_LABEL = 'text-[10px] font-black text-slate-500 uppercase tracking-wider';

export function CreateClienteModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateClienteModalProps) {
  const router = useRouter();
  const formId = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('identificacion');

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

  // Validar si el tab actual tiene errores para mostrar indicador visual
  const tabHasErrors = (tab: string): boolean => {
    const errors = form.formState.errors;
    if (tab === 'identificacion') {
      return !!(errors.tipo_documento || errors.ruc || errors.nombre || errors.apellido_paterno || errors.razon_social);
    }
    if (tab === 'configuracion') {
      return !!(errors.moneda_defecto || errors.forma_pago_defecto || errors.impuesto_defecto);
    }
    if (tab === 'ubicacion') {
      return !!(errors.direccion_fiscal || errors.pais);
    }
    return false;
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      setActiveTab('identificacion');
    }
    onOpenChange(isOpen);
  };

  const onSubmit = async (data: CreateClienteInput) => {
    try {
      setIsSubmitting(true);

      const result = await createCliente(data);

      if (!result.success) {
        toast.error(result.error ?? 'Error al crear el cliente');
        return;
      }

      toast.success(`✅ Cliente ${result.data?.nombre_completo ?? result.data?.ruc} creado exitosamente`);
      onSuccess();
      router.refresh();
      handleOpenChange(false);
    } catch {
      toast.error('Error inesperado al crear el cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextTab = (currentTab: string, nextTab: string) => {
    // Validar campos del tab actual antes de avanzar
    const fieldsToValidate: Record<string, (keyof CreateClienteInput)[]> = {
      identificacion: ['tipo_documento', 'ruc'],
      configuracion: [],
    };

    const fields = fieldsToValidate[currentTab];
    if (fields) {
      form.trigger(fields);
    }

    setActiveTab(nextTab);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col rounded-2xl">
        <DialogHeader className="pb-3 border-b border-slate-200">
          <DialogTitle className="text-xl font-black uppercase text-slate-900 flex items-center gap-2">
            <Building2 size={18} className="text-blue-600" />
            Nuevo Cliente
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-bold text-xs uppercase">
            Complete los datos del cliente en los pasos siguientes
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden flex flex-col"
        >
          {/* Tabs List */}
          <TabsList className="grid grid-cols-3 h-10 bg-slate-100 rounded-lg mt-4">
            <TabsTrigger
              value="identificacion"
              className="text-[10px] font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-slate-900 flex items-center gap-1"
            >
              {esPersonaJuridica ? (
                <Building2 size={12} />
              ) : (
                <User size={12} />
              )}
              Identificación
              {tabHasErrors('identificacion') && (
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full ml-1" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="configuracion"
              className="text-[10px] font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-slate-900 flex items-center gap-1"
            >
              <Settings size={12} />
              Comercial
              {tabHasErrors('configuracion') && (
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full ml-1" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="ubicacion"
              className="text-[10px] font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-slate-900 flex items-center gap-1"
            >
              <MapPin size={12} />
              Ubicación
              {tabHasErrors('ubicacion') && (
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full ml-1" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════
              TAB 1: IDENTIFICACIÓN
              ═══════════════════════════════════════════ */}
          <TabsContent value="identificacion" className="flex-1 overflow-y-auto py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

              {/* RUC/DNI con búsqueda */}
              <FormField
                control={form.control}
                name="ruc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={ERP_LABEL}>
                      {tipoDocumento} *
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          className="h-10 border-slate-200 rounded-xl text-xs flex-1"
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
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-slate-200 shrink-0"
                        onClick={() => {
                          toast.info('Búsqueda de RUC/DNI próximamente');
                        }}
                      >
                        <Search size={14} />
                      </Button>
                    </div>
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

              {/* Estado Comercial */}
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

            <Separator className="bg-slate-200" />

            {/* Persona Jurídica */}
            {esPersonaJuridica && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-blue-600" />
                  <h4 className="text-xs font-black uppercase text-slate-700">
                    Datos de Empresa
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
              </div>
            )}

            {/* Persona Natural */}
            {esPersonaNatural && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-emerald-600" />
                  <h4 className="text-xs font-black uppercase text-slate-700">
                    Datos Personales
                  </h4>
                </div>

                <div className="grid grid-cols-3 gap-4">
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
              </div>
            )}

            {/* Contacto */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════
              TAB 2: CONFIGURACIÓN COMERCIAL
              ═══════════════════════════════════════════ */}
          <TabsContent value="configuracion" className="flex-1 overflow-y-auto py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Moneda Defecto */}
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

              {/* Forma Pago Defecto */}
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

              {/* Impuesto Defecto */}
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

              {/* Lista Precios */}
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

              {/* Método Comercial */}
              <FormField
                control={form.control}
                name="metodo_comercial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={ERP_LABEL}>Método Comercial</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-10 border-slate-200 rounded-xl text-xs"
                        placeholder="Despachar->Facturar..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipo Pedido Defecto */}
              <FormField
                control={form.control}
                name="tipo_pedido_defecto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={ERP_LABEL}>Tipo Pedido Defecto</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-10 border-slate-200 rounded-xl text-xs"
                        placeholder="LOCAL, EXPORTACIÓN..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sector */}
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

              {/* Categoría Cliente */}
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
          </TabsContent>

          {/* ═══════════════════════════════════════════
              TAB 3: UBICACIÓN
              ═══════════════════════════════════════════ */}
          <TabsContent value="ubicacion" className="flex-1 overflow-y-auto py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Dirección Fiscal */}
              <FormField
                control={form.control}
                name="direccion_fiscal"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className={ERP_LABEL}>Dirección Fiscal</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-10 border-slate-200 rounded-xl text-xs"
                        placeholder="Av. Principal 123, Lima, Perú"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* País */}
              <FormField
                control={form.control}
                name="pais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={ERP_LABEL}>País</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 border-slate-200 rounded-xl text-xs">
                          <SelectValue placeholder="País..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Peru">Perú</SelectItem>
                        <SelectItem value="Chile">Chile</SelectItem>
                        <SelectItem value="Colombia">Colombia</SelectItem>
                        <SelectItem value="Ecuador">Ecuador</SelectItem>
                        <SelectItem value="Bolivia">Bolivia</SelectItem>
                        <SelectItem value="Brasil">Brasil</SelectItem>
                        <SelectItem value="Argentina">Argentina</SelectItem>
                        <SelectItem value="México">México</SelectItem>
                        <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                        <SelectItem value="España">España</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ciudad */}
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
                        placeholder="Lima, Arequipa, etc."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <MapPin size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-800">
                    Dirección Principal
                  </p>
                  <p className="text-[10px] text-blue-600 mt-1">
                    Puede agregar direcciones adicionales después desde la ficha del cliente.
                    La dirección fiscal se usará para facturación electrónica.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* ═══════════════════════════════════════════
            BOTONES DE ACCIÓN
            ═══════════════════════════════════════════ */}
        <DialogFooter className="flex gap-3 sm:justify-between border-t border-slate-200 pt-4 mt-2">
          <div>
            {activeTab !== 'identificacion' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (activeTab === 'configuracion') setActiveTab('identificacion');
                  if (activeTab === 'ubicacion') setActiveTab('configuracion');
                }}
                className="h-10 font-bold uppercase rounded-xl text-xs"
                disabled={isSubmitting}
              >
                ← Anterior
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="h-10 font-bold uppercase rounded-xl text-xs"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </DialogClose>

            {activeTab !== 'ubicacion' ? (
              <Button
                type="button"
                onClick={() => {
                  if (activeTab === 'identificacion') handleNextTab('identificacion', 'configuracion');
                  if (activeTab === 'configuracion') handleNextTab('configuracion', 'ubicacion');
                }}
                className="h-10 bg-slate-900 hover:bg-slate-800 font-bold uppercase rounded-xl text-xs gap-1"
              >
                Siguiente →
              </Button>
            ) : (
              <Button
                type="submit"
                form={`${formId}-cliente-form`}
                disabled={isSubmitting}
                className="h-10 bg-emerald-600 hover:bg-emerald-700 font-bold uppercase rounded-xl text-xs gap-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    Guardar Cliente
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>

        {/* Form oculto para submit */}
        <Form {...form}>
          <form id={`${formId}-cliente-form`} onSubmit={form.handleSubmit(onSubmit)} className="hidden" />
        </Form>
      </DialogContent>
    </Dialog>
  );
}

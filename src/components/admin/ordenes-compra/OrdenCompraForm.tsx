'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { toast } from 'sonner';
import { fetchProveedores } from '@/lib/helpers/proveedores-helpers';
import { fetchMateriales } from '@/lib/helpers/materiales-helpers';
import { fetchInsumos } from '@/lib/helpers/inventario-helpers';
import { useOrdenesCompra } from '@/lib/hooks/useOrdenesCompra';
import { type MaterialCatalogo } from '@/lib/schemas/material';
import {
  LABEL_TIPO_IMPUESTO_OC,
  TASA_IGV_PEN,
  TIPO_IMPUESTO_OC,
  type TipoImpuestoOc,
} from '@/lib/constants/ordenes-compra';
import type { OrdenCompraExtraccion } from '@/lib/schemas/orden-compra-extraccion';
import { OrdenCompraPdfExtractor } from '@/components/admin/ordenes-compra/OrdenCompraPdfExtractor';

const itemFormSchema = z.object({
  tipo: z.enum(['material', 'insumo']),
  ref_id: z.string().min(1, 'Seleccione un ítem'),
  cantidad_pedida: z.number({ message: 'Cantidad inválida' }).positive('Cantidad inválida'),
  precio_unitario: z.number({ message: 'Precio inválido' }).nonnegative('Precio inválido'),
  tipo_impuesto: z.enum([TIPO_IMPUESTO_OC.IGV, TIPO_IMPUESTO_OC.SIN_IGV]).default(TIPO_IMPUESTO_OC.IGV),
  notas: z.string().optional(),
});

const formSchema = z.object({
  proveedor_id: z.string().min(1, 'Seleccione un proveedor'),
  fecha_prometida: z.string().optional(),
  notas: z.string().optional(),
  items: z.array(itemFormSchema).min(1, 'Agregue al menos un ítem'),
});

type FormValues = z.infer<typeof formSchema>; 

interface Props {
  cotizacionId?: string | null; 
  proveedorIdPreselect?: string | null; 
  modoCotizacion?: boolean; 
}

interface ItemCatalogo {
  id: number;
  nombre: string;
}

interface ProveedorCatalogo {
  id: string | number;
  razon_social: string;
}

export function OrdenCompraForm({
  cotizacionId, 
  proveedorIdPreselect, 
  modoCotizacion = false, 
}: Props) {
  const router = useRouter(); 
  const { crear, crearDesdeCotizacion, isCreating } = useOrdenesCompra({ enabled: false }); 

  const [proveedores, setProveedores] = useState<{ id: string; razon_social: string }[]>([]);
  const [materiales, setMateriales] = useState<ItemCatalogo[]>([]);
  const [insumos, setInsumos] = useState<ItemCatalogo[]>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [proveedorExtraccion, setProveedorExtraccion] = useState<{
    matched: boolean;
    nombre?: string | null;
    ruc?: string | null;
    extraido?: string | null;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema), 
    defaultValues: {
      proveedor_id: proveedorIdPreselect ?? '', 
      fecha_prometida: '', 
      notas: '', 
      items: [
        {
          tipo: 'insumo',
          ref_id: '',
          cantidad_pedida: 1,
          precio_unitario: 0,
          tipo_impuesto: TIPO_IMPUESTO_OC.IGV,
          notas: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });
  
  const watchedItems = useWatch({
    control: form.control,
    name: 'items',
    defaultValue: form.getValues('items'),
  });

  useEffect(() => {
    async function load() {
      try {
        const [provRes, mats, insRes] = await Promise.all([
          fetchProveedores(1, 200, '', 'activo'),
          fetchMateriales(),
          fetchInsumos(),
        ]);

        const provList = (provRes?.data as ProveedorCatalogo[]) ?? [];
        setProveedores(
          provList.map((p) => ({
            id: String(p.id),
            razon_social: p.razon_social,
          })),
        );

        const materialesValidos = (mats as MaterialCatalogo[]) ?? [];
        setMateriales(materialesValidos.map((m) => ({ id: m.id, nombre: m.nombre })));

        // Adaptado de forma segura por si insRes no tuviera una interfaz definida
        const insumosLista = (insRes as any)?.insumos ?? [];
        setInsumos(
          insumosLista.map((i: { id: number; nombre: string }) => ({
            id: i.id,
            nombre: i.nombre,
          })),
        );
      } catch {
        toast.error('Error al cargar catálogos'); 
      } finally {
        setLoadingCatalogos(false); 
      }
    }
    load(); 
  }, []);

  const subtotal = (watchedItems ?? []).reduce(
    (acc, item) => acc + (item?.cantidad_pedida || 0) * (item?.precio_unitario || 0),
    0,
  );

  const igvTotal = (watchedItems ?? []).reduce((acc, item) => {
    const linea = (item?.cantidad_pedida || 0) * (item?.precio_unitario || 0);
    if (item?.tipo_impuesto === TIPO_IMPUESTO_OC.IGV) {
      return acc + linea * TASA_IGV_PEN;
    }
    return acc;
  }, 0);

  const totalConImpuesto = subtotal + igvTotal;

  const aplicarExtraccion = (data: OrdenCompraExtraccion) => {
    if (data.proveedor_id && data.proveedor_nombre) {
      form.setValue('proveedor_id', data.proveedor_id, { shouldValidate: true });
      setProveedores((prev) => {
        if (prev.some((p) => p.id === data.proveedor_id)) return prev;
        return [
          { id: data.proveedor_id!, razon_social: data.proveedor_nombre! },
          ...prev,
        ];
      });
      setProveedorExtraccion({
        matched: true,
        nombre: data.proveedor_nombre,
        ruc: data.proveedor_ruc ?? null,
      });
    } else if (data.proveedor_sin_match) {
      setProveedorExtraccion({
        matched: false,
        extraido: data.proveedor_razon_extraida || data.proveedor_ruc_extraido || null,
        ruc: data.proveedor_ruc_extraido ?? null,
      });
    } else {
      setProveedorExtraccion(null);
    }

    if (data.notas) {
      const prev = form.getValues('notas');
      form.setValue('notas', prev ? `${prev}\n${data.notas}` : data.notas);
    }

    if (data.fecha_prometida) {
      form.setValue('fecha_prometida', data.fecha_prometida);
    }

    const itemsForm = data.items.map((item) => ({
      tipo: (item.tipo ?? 'insumo') as 'material' | 'insumo',
      ref_id: item.ref_id ?? '',
      cantidad_pedida: item.cantidad > 0 ? item.cantidad : 1,
      precio_unitario: item.precio_unitario,
      tipo_impuesto: (item.tipo_impuesto ?? TIPO_IMPUESTO_OC.IGV) as TipoImpuestoOc,
      notas: item.sin_match ? item.descripcion : '',
    }));

    form.setValue('items', itemsForm.length > 0 ? itemsForm : form.getValues('items'));
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (modoCotizacion && cotizacionId) { 
        const res = await crearDesdeCotizacion({
          cotizacion_proveedor_id: Number(cotizacionId), 
          fecha_prometida: data.fecha_prometida ? new Date(data.fecha_prometida) : null, 
          notas: data.notas || null, 
        });
        if (!res.success) throw new Error(res.error || 'Error al generar orden'); 
        router.push(
          `/admin/Panel-Administrativo/ordenes-compra/${(res.data as { id: number }).id}`,
        );
        return;
      }

      const items = data.items.map((item) => ({
        material_id: item.tipo === 'material' ? Number(item.ref_id) : null, 
        insumo_id: item.tipo === 'insumo' ? Number(item.ref_id) : null, 
        cantidad_pedida: item.cantidad_pedida, 
        precio_unitario: item.precio_unitario, 
        notas: item.notas || null, 
      }));

      const res = await crear({
        proveedor_id: Number(data.proveedor_id), 
        cotizacion_proveedor_id: cotizacionId ? Number(cotizacionId) : null, 
        fecha_prometida: data.fecha_prometida ? new Date(data.fecha_prometida) : null, 
        notas: data.notas || null, 
        items, 
      });
      if (!res.success) throw new Error(res.error || 'Error al crear orden'); 
      router.push(
        `/admin/Panel-Administrativo/ordenes-compra/${(res.data as { id: number }).id}`, 
      );
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar'); 
    }
  };

  if (loadingCatalogos) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver 
          </Button>
        </div>

        {modoCotizacion && cotizacionId && (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-sm text-blue-800">
            Generando orden desde cotización <strong>#{cotizacionId}</strong>. Los ítems se
            copiarán automáticamente al confirmar. 
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            Datos generales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control} 
              name="proveedor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      setProveedorExtraccion(null);
                    }}
                    disabled={modoCotizacion}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar proveedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {proveedores.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.razon_social}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {proveedorExtraccion?.matched && (
                    <p className="text-xs text-emerald-700">
                      Vinculado desde PDF: {proveedorExtraccion.nombre}
                      {proveedorExtraccion.ruc ? ` (RUC ${proveedorExtraccion.ruc})` : ''}
                    </p>
                  )}
                  {proveedorExtraccion && !proveedorExtraccion.matched && (
                    <p className="text-xs text-amber-700">
                      PDF: {proveedorExtraccion.extraido ?? 'Proveedor no identificado'}
                      {proveedorExtraccion.ruc ? ` · RUC ${proveedorExtraccion.ruc}` : ''}
                      {' — '}selecciónelo manualmente.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fecha_prometida"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha prometida</FormLabel> 
                  <FormControl>
                    <Input type="date" {...field} /> 
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notas"
            render={({ field }) => (
              <FormItem> 
                <FormLabel>Notas</FormLabel> 
                <FormControl>
                  <Textarea rows={3} placeholder="Observaciones..." {...field} /> 
                </FormControl>
                <FormMessage />
              </FormItem> 
            )}
          />
        </div>

        {!modoCotizacion && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
            <OrdenCompraPdfExtractor onExtracted={aplicarExtraccion} />

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Ítems
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    tipo: 'insumo',
                    ref_id: '',
                    cantidad_pedida: 1,
                    precio_unitario: 0,
                    tipo_impuesto: TIPO_IMPUESTO_OC.IGV,
                    notas: '',
                  })
                }
              >
                <Plus className="w-4 h-4 mr-1" /> Agregar
              </Button>
            </div>

            {fields.map((field, index) => {
              const tipo = watchedItems?.[index]?.tipo ?? 'insumo'; 
              const opciones = tipo === 'material' ? materiales : insumos; 
              return (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <FormField
                    control={form.control} 
                    name={`items.${index}.tipo`}
                    render={({ field: f }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Tipo</FormLabel> 
                        <Select value={f.value} onValueChange={f.onChange}> 
                          <FormControl>
                            <SelectTrigger> 
                              <SelectValue /> 
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="material">Material</SelectItem> 
                            <SelectItem value="insumo">Insumo</SelectItem> 
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.ref_id`}
                    render={({ field: f }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel>Producto</FormLabel>
                        <Select value={f.value} onValueChange={f.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {opciones.map((o) => (
                              <SelectItem key={o.id} value={String(o.id)}>
                                {o.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {watchedItems?.[index]?.notas && !f.value && (
                          <p className="text-xs text-amber-600 truncate" title={watchedItems[index]?.notas}>
                            PDF: {watchedItems[index]?.notas}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control} 
                    name={`items.${index}.cantidad_pedida`}
                    render={({ field: f }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Cantidad</FormLabel> 
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01" 
                            min="0" 
                            {...f}
                            value={Number.isNaN(f.value) ? '' : f.value}
                            onChange={(e) => f.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.precio_unitario`}
                    render={({ field: f }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>P. unit.</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...f}
                            value={Number.isNaN(f.value) ? '' : f.value}
                            onChange={(e) => f.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.tipo_impuesto`}
                    render={({ field: f }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Impuesto</FormLabel>
                        <Select value={f.value} onValueChange={f.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={TIPO_IMPUESTO_OC.IGV}>
                              {LABEL_TIPO_IMPUESTO_OC.igv}
                            </SelectItem>
                            <SelectItem value={TIPO_IMPUESTO_OC.SIN_IGV}>
                              {LABEL_TIPO_IMPUESTO_OC.sin_igv}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm" 
                      className="text-red-500" 
                      onClick={() => remove(index)} 
                      disabled={fields.length <= 1} 
                    >
                      <Trash2 className="w-4 h-4" /> 
                    </Button>
                  </div>
                </div>
              );
            })}

            <div className="text-right space-y-1 text-sm text-slate-600">
              <p>
                Subtotal: S/ {subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
              <p>
                IGV (18%): S/ {igvTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-lg font-black text-slate-900">
                Total: S/ {totalConImpuesto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-400">
                El impuesto es referencial en pantalla; no se guarda en la orden.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar 
          </Button>
          <Button type="submit" disabled={isCreating} className="bg-rose-600 hover:bg-rose-700"> 
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> 
            ) : (
              <Save className="w-4 h-4 mr-2" /> 
            )}
            {modoCotizacion ? 'Generar orden de compra' : 'Crear orden de compra'} 
          </Button>
        </div>
      </form>
    </Form>
  );
}
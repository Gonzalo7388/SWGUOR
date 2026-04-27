'use client';

import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, ArrowLeft, Plus, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  FormField, FormControl, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import PdfUploadExtractor from '@/components/admin/common/PdfUploadExtractor';

// Schema de validación
const itemSchema = z.object({
  descripcion: z.string().min(1, 'Descripción requerida'),
  cantidad: z.number().positive('Cantidad debe ser mayor a 0'),
  precio_unitario: z.number().nonnegative('Precio no puede ser negativo'),
});

const cotizacionProveedorSchema = z.object({
  proveedor_nombre: z.string().min(1, 'Nombre del proveedor es requerido'),
  proveedor_ruc: z.string().optional(),
  proveedor_email: z.string().email().optional().or(z.literal('')),
  proveedor_telefono: z.string().optional(),
  numero_cotizacion: z.string().optional(),
  fecha_cotizacion: z.string(),
  fecha_vencimiento: z.string().optional(),
  moneda: z.enum(['PEN', 'USD', 'EUR']),
  items: z.array(itemSchema).min(1, 'Debe haber al menos un ítem'),
  notas: z.string().optional(),
});

type CotizacionProveedorInput = z.infer<typeof cotizacionProveedorSchema>;

export function CotizacionProveedorForm({ proveedores }: { proveedores?: any[] }) {
  const router = useRouter();
  const formId = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CotizacionProveedorInput>({
    resolver: zodResolver(cotizacionProveedorSchema),
    defaultValues: {
      proveedor_nombre: '',
      proveedor_ruc: '',
      proveedor_email: '',
      proveedor_telefono: '',
      numero_cotizacion: '',
      fecha_cotizacion: new Date().toISOString().split('T')[0],
      fecha_vencimiento: '',
      moneda: 'PEN',
      items: [{ descripcion: '', cantidad: 1, precio_unitario: 0 }],
      notas: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Calcular totales
  const items = form.watch('items');
  const moneda = form.watch('moneda');
  const subtotal = items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
  const total = subtotal; // Sin IGV para proveedores

  // Manejar extracción de PDF
  const handlePdfExtracted = (data: any) => {
    if (data.proveedor_nombre) form.setValue('proveedor_nombre', data.proveedor_nombre);
    if (data.proveedor_ruc) form.setValue('proveedor_ruc', data.proveedor_ruc);
    if (data.proveedor_email) form.setValue('proveedor_email', data.proveedor_email);
    if (data.proveedor_telefono) form.setValue('proveedor_telefono', data.proveedor_telefono);
    if (data.numero_cotizacion) form.setValue('numero_cotizacion', data.numero_cotizacion);
    if (data.fecha_cotizacion) form.setValue('fecha_cotizacion', data.fecha_cotizacion);
    if (data.fecha_vencimiento) form.setValue('fecha_vencimiento', data.fecha_vencimiento);
    if (data.moneda) form.setValue('moneda', data.moneda as 'PEN' | 'USD' | 'EUR');
    if (data.notas) form.setValue('notas', data.notas);

    // Reemplazar items si vienen del PDF
    if (data.items && Array.isArray(data.items) && data.items.length > 0) {
      // Limpiar items previos
      while (fields.length > 0) {
        remove(0);
      }
      // Agregar nuevos items
      data.items.forEach((item: any) => {
        append({
          descripcion: item.descripcion || '',
          cantidad: Number(item.cantidad) || 1,
          precio_unitario: Number(item.precio_unitario) || 0,
        });
      });
      toast.success(`Se extrajeron ${data.items.length} items de la cotización`);
    }
  };

  const onSubmit = async (data: CotizacionProveedorInput) => {
    try {
      setIsSubmitting(true);

      const res = await fetch('/api/admin/cotizaciones-proveedor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          pdf_url: null,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Error al crear cotización');
      }

      toast.success('Cotización de proveedor registrada correctamente');
      router.push('/admin/Panel-Administrativo/cotizaciones-proveedor');
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar la cotización');
    } finally {
      setIsSubmitting(false);
    }
  };

  const simboloMoneda = moneda === 'USD' ? '$' : moneda === 'EUR' ? '€' : 'S/';

  return (
    <Form {...form}>
      <form
        id={`${formId}-cotizacion-proveedor`}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* ────────────────────────────────── EXTRACCIÓN PDF ─────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-blue-600 rounded-full" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Cargar desde PDF
            </h2>
          </div>

          <p className="text-sm text-slate-500">
            Sube una cotización en PDF para extraer automáticamente los datos (proveedor, ítems, precios)
          </p>

          <PdfUploadExtractor
            extractType="cotizacion"
            label="Cargar PDF de Cotización"
            description="Arrastra el PDF de la cotización o haz clic para seleccionar"
            onExtract={handlePdfExtracted}
          />

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs text-blue-700 font-semibold">
              💡 <strong>Tip:</strong> Si la extracción no es perfecta, puedes editar los campos manualmente a continuación.
            </p>
          </div>
        </div>

        {/* ────────────────────────────────── DATOS DEL PROVEEDOR ─────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-slate-900 rounded-full" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Datos del Proveedor
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="proveedor_nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Nombre del Proveedor *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej. Comercial ACME S.A.C."
                      className="h-10 border-slate-200 rounded-xl text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="proveedor_ruc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    RUC
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="20123456789"
                      className="h-10 border-slate-200 rounded-xl text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="proveedor_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="contacto@acme.com"
                      className="h-10 border-slate-200 rounded-xl text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="proveedor_telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Teléfono
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="(01) 1234-5678"
                      className="h-10 border-slate-200 rounded-xl text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ────────────────────────────────── DATOS DE COTIZACIÓN ────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-emerald-600 rounded-full" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Datos de la Cotización
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="numero_cotizacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Número de Cotización
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej. COT-2024-001"
                      className="h-10 border-slate-200 rounded-xl text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fecha_cotizacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Fecha Cotización *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      className="h-10 border-slate-200 rounded-xl text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fecha_vencimiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Vencimiento
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      className="h-10 border-slate-200 rounded-xl text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="moneda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Moneda *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 border-slate-200 rounded-xl text-sm">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PEN">PEN (Soles)</SelectItem>
                      <SelectItem value="USD">USD (Dólares)</SelectItem>
                      <SelectItem value="EUR">EUR (Euros)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ────────────────────────────────── ÍTEMS ────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-purple-600 rounded-full" />
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Ítems de la Cotización
              </h2>
              {fields.length > 0 && (
                <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-black rounded-full">
                  {fields.length}
                </span>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ descripcion: '', cantidad: 1, precio_unitario: 0 })}
              className="h-9 gap-1.5 text-xs font-bold uppercase rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Plus size={14} /> Agregar Ítem
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
                Sin ítems agregados
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div key={field.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-6">
                      <Controller
                        control={form.control}
                        name={`items.${idx}.descripcion`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Descripción *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...f}
                                placeholder="Descripción del producto/servicio"
                                className="h-10 border-slate-200 rounded-xl text-sm"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <Controller
                        control={form.control}
                        name={`items.${idx}.cantidad`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Cantidad *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...f}
                                type="number"
                                min="1"
                                onChange={(e) => f.onChange(Number(e.target.value))}
                                className="h-10 border-slate-200 rounded-xl text-sm"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-3">
                      <Controller
                        control={form.control}
                        name={`items.${idx}.precio_unitario`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Precio Unitario *
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                                  {simboloMoneda}
                                </span>
                                <Input
                                  {...f}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  onChange={(e) => f.onChange(Number(e.target.value))}
                                  className="h-10 border-slate-200 rounded-xl text-sm pl-6"
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(idx)}
                        className="h-10 w-10 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right text-xs">
                    <span className="text-slate-400">Subtotal: </span>
                    <span className="font-bold text-slate-900">
                      {simboloMoneda} {((form.watch(`items.${idx}.cantidad`) || 0) * (form.watch(`items.${idx}.precio_unitario`) || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <FormMessage className="text-red-500" />
        </div>

        {/* ────────────────────────────────── RESUMEN FINANCIERO ────────────────────────────── */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl p-8 text-white space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight">
            Resumen Financiero
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Subtotal</p>
              <p className="text-3xl font-black text-white">
                {simboloMoneda} {subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:col-span-2 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Moneda</p>
                <p className="text-xl font-black text-slate-300">{moneda}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Total</p>
                <p className="text-4xl font-black text-white">
                  {simboloMoneda} {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ────────────────────────────────── NOTAS ────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-amber-600 rounded-full" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Notas Adicionales
            </h2>
          </div>

          <FormField
            control={form.control}
            name="notas"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Notas / Condiciones especiales
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Cualquier nota o condición especial de la cotización..."
                    rows={4}
                    className="border-slate-200 rounded-xl text-sm resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ────────────────────────────────── ACCIONES ────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-4 sticky bottom-6 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="h-11 px-6 font-bold uppercase rounded-xl gap-2"
          >
            <ArrowLeft size={15} /> Cancelar
          </Button>
          <Button
            type="submit"
            form={`${formId}-cotizacion-proveedor`}
            disabled={isSubmitting}
            className="h-11 px-8 bg-slate-900 hover:bg-slate-800 font-bold uppercase rounded-xl gap-2 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Save size={15} /> Crear Cotización
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

'use client';

import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, ArrowLeft, Plus, Trash2, FileText, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  FormField, FormControl, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import ImagenGeometralExtractor from '@/components/admin/common/ImagenGeometralExtractor';
import { usePermissions } from '@/lib/hooks/usePermissions';

// ─── Schemas ────────────────────────────────────────────────────────────────

const medidaSchema = z.object({
  punto_medida: z.string().min(1, 'Punto de medida requerido'),
  talla:        z.string().min(1, 'Talla requerida'),
  valor_cm:     z.number().nonnegative().optional(),
  tolerancia:   z.number().nonnegative().optional(),
});

const fichaTecnicaSchema = z.object({
  producto_id:           z.string(),
  version:               z.string().optional(),
  descripcion_detallada: z.string().optional(),
  sam_total:             z.number().nonnegative().optional(),
  costo_estimado:        z.number().nonnegative().optional(),
  imagen_geometral:      z.string().optional(),
  medidas:               z.array(medidaSchema),
});

type FichaTecnicaInput = z.infer<typeof fichaTecnicaSchema>;

// ─── Componente ─────────────────────────────────────────────────────────────

export function FichaTecnicaForm({ productos }: { productos?: any[] }) {
  const router = useRouter();
  const formId = useId();
  const { can, isLoading: authLoading } = usePermissions();

  const [isSubmitting,        setIsSubmitting]        = useState(false);
  const [tallasProducto,      setTallasProducto]      = useState<string[]>([]);
  const [coloresProducto,     setColoresProducto]     = useState<string[]>([]);

  const puedeCrearFicha = can('create', 'ficha_tecnica');
  const puedeMedidas    = can('edit',   'ficha_tecnica');

  const form = useForm<FichaTecnicaInput>({
    resolver: zodResolver(fichaTecnicaSchema),
    defaultValues: {
      producto_id:           '',
      version:               '1.0',
      descripcion_detallada: '',
      sam_total:             undefined,
      costo_estimado:        undefined,
      imagen_geometral:      undefined,
      medidas: [{ punto_medida: '', talla: '', valor_cm: undefined, tolerancia: undefined }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'medidas',
  });

  // ── Callback del extractor de imagen geometral ─────────────
  const handleGeometralExtracted = (data: any, imagenUrl?: string) => {
    // Guardar URL de la imagen geometral
    if (imagenUrl) form.setValue('imagen_geometral', imagenUrl);

    // Poblar campos básicos extraídos por la IA
    if (data?.descripcion)    form.setValue('descripcion_detallada', data.descripcion);
    if (data?.sam_total)      form.setValue('sam_total',      Number(data.sam_total));
    if (data?.costo_estimado) form.setValue('costo_estimado', Number(data.costo_estimado));

    // Tallas y colores vienen del producto (ya consultados en el backend)
    if (data?.tallas_disponibles?.length)  setTallasProducto(data.tallas_disponibles);
    if (data?.colores_disponibles?.length) setColoresProducto(data.colores_disponibles);

    // Reemplazar medidas con las extraídas
    if (data?.medidas?.length > 0) {
      replace(
        data.medidas.map((m: any) => ({
          punto_medida: m.punto_medida || '',
          talla:        m.talla        || '',
          valor_cm:     m.valor_cm     ? Number(m.valor_cm)   : undefined,
          tolerancia:   m.tolerancia   ? Number(m.tolerancia) : undefined,
        }))
      );
      toast.success(`Se extrajeron ${data.medidas.length} puntos de medida`);
    }
  };

  // ── Submit ─────────────────────────────────────────────────
  const onSubmit = async (data: FichaTecnicaInput) => {
    try {
      setIsSubmitting(true);

      if (!puedeCrearFicha) {
        toast.error('No tienes permisos para crear fichas técnicas');
        return;
      }
      if (!data.producto_id) {
        toast.error('Debes seleccionar un producto');
        return;
      }

      // 1. Crear ficha técnica
      const res = await fetch('/api/admin/fichas-tecnicas', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producto_id:           Number(data.producto_id),
          version:               data.version,
          descripcion_detallada: data.descripcion_detallada || null,
          sam_total:             data.sam_total      || null,
          costo_estimado:        data.costo_estimado || null,
          imagen_geometral:      data.imagen_geometral || null,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al crear ficha técnica');

      const fichaId = result.data?.id;

      // 2. Guardar medidas en bulk
      if (puedeMedidas && data.medidas?.length > 0 && fichaId) {
        const medidasRes = await fetch('/api/admin/fichas-tecnicas/medidas', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ficha_id: fichaId, 
            medidas: data.medidas 
          }),
        });
        if (!medidasRes.ok) toast.warning('Ficha creada pero hubo un error al guardar medidas');
      }

      toast.success('Ficha técnica registrada correctamente');
      router.push('/admin/Panel-Administrativo/fichas-tecnicas');

    } catch (error: any) {
      toast.error(error.message || 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tallasUnicas = new Set(
    (form.watch('medidas') || []).map(m => m.talla).filter(Boolean)
  );

  const productoSeleccionadoId = form.watch('producto_id');

  // ── Guards ─────────────────────────────────────────────────
  if (authLoading) return (
    <div className="h-64 flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Verificando permisos...</p>
    </div>
  );

  if (!puedeCrearFicha) return (
    <div className="bg-white rounded-3xl border border-red-100 p-10 flex flex-col items-center gap-3 text-center">
      <ShieldAlert className="w-10 h-10 text-red-400" />
      <p className="font-black text-slate-800 text-lg">Sin permisos</p>
      <p className="text-sm text-slate-500">Solo diseñadores y administradores pueden crear fichas técnicas.</p>
      <Button variant="outline" onClick={() => router.back()} className="mt-2">Volver</Button>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────
  return (
    <Form {...form}>
      <form
        id={`${formId}-ficha-tecnica`}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >

        {/* ── SECCIÓN 1: Información General ── */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-slate-900 rounded-full" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Información General
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Selector de producto */}
            <FormField
              control={form.control}
              name="producto_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Producto *
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full h-10 border border-slate-200 rounded-xl text-sm px-3 bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    >
                      <option value="">Seleccionar producto...</option>
                      {productos?.map(p => (
                        <option key={p.id} value={p.id.toString()}>
                          {p.nombre} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Versión */}
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Versión
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="1.0" className="h-10 border-slate-200 rounded-xl text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SAM + Costo */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="sam_total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      SAM Total (min)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number" min="0"
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="0"
                        className="h-10 border-slate-200 rounded-xl text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="costo_estimado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Costo Est. (S/)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number" min="0" step="0.01"
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="0.00"
                        className="h-10 border-slate-200 rounded-xl text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Descripción */}
          <FormField
            control={form.control}
            name="descripcion_detallada"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Descripción Detallada
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Descripción general del producto y su uso..."
                    rows={3}
                    className="border-slate-200 rounded-xl text-sm resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tallas y colores del producto (se llenan tras extracción) */}
          {(tallasProducto.length > 0 || coloresProducto.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {tallasProducto.length > 0 && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">
                    Tallas disponibles (desde producto)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tallasProducto.map(t => (
                      <span key={t} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {coloresProducto.length > 0 && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">
                    Colores disponibles (desde producto)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {coloresProducto.map(c => (
                      <span key={c} className="px-3 py-1 bg-pink-50 border border-pink-100 rounded-lg text-xs font-bold text-pink-700">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── SECCIÓN 2: Imagen Geometral + Extracción IA ── */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-pink-600 rounded-full" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Imagen Geometral
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            Sube la imagen geometral de la prenda. La IA extraerá automáticamente las medidas,
            materiales, SAM y costo estimado. Las tallas y colores se obtienen del producto seleccionado.
          </p>

          <ImagenGeometralExtractor
            productoId={productoSeleccionadoId || undefined}
            onExtract={handleGeometralExtracted}
            disabled={!productoSeleccionadoId}
            label={
              productoSeleccionadoId
                ? 'Cargar imagen geometral'
                : 'Selecciona un producto primero'
            }
          />

          {!productoSeleccionadoId && (
            <p className="text-xs text-amber-600 font-semibold">
              ⚠ Selecciona un producto para que la IA pueda obtener tallas y colores automáticamente.
            </p>
          )}

          {/* Preview imagen si ya fue subida */}
          {form.watch('imagen_geometral') && (
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest p-3 border-b border-slate-100">
                Imagen guardada
              </p>
              <img
                src={form.watch('imagen_geometral')}
                alt="Geometral"
                className="max-h-64 object-contain mx-auto p-4"
              />
            </div>
          )}
        </div>

        {/* ── SECCIÓN 3: Tabla de Medidas ── */}
        {puedeMedidas && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-purple-600 rounded-full" />
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  Tabla de Medidas
                </h2>
                {fields.length > 0 && (
                  <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-black rounded-full">
                    {fields.length}
                  </span>
                )}
                {tallasUnicas.size > 0 && (
                  <span className="text-xs font-semibold text-slate-500">
                    {tallasUnicas.size} talla{tallasUnicas.size !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ punto_medida: '', talla: '', valor_cm: undefined, tolerancia: undefined })}
                className="h-9 gap-1.5 text-xs font-bold uppercase rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Plus size={14} /> Agregar Medida
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
                  Sin medidas — sube la imagen geometral para extraerlas automáticamente
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Punto de Medida</th>
                      <th className="text-center py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Talla</th>
                      <th className="text-center py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Valor (cm)</th>
                      <th className="text-center py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Tolerancia (cm)</th>
                      <th className="text-center py-3 px-4 text-[10px] font-black text-slate-400 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fields.map((field, idx) => (
                      <tr key={field.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <Controller
                            control={form.control}
                            name={`medidas.${idx}.punto_medida`}
                            render={({ field: f }) => (
                              <Input {...f} placeholder="Ej. Largo, Ancho..." className="h-8 border-slate-200 rounded text-xs" />
                            )}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Controller
                            control={form.control}
                            name={`medidas.${idx}.talla`}
                            render={({ field: f }) => (
                              <Input {...f} placeholder="S, M, L..." className="h-8 border-slate-200 rounded text-xs text-center" />
                            )}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Controller
                            control={form.control}
                            name={`medidas.${idx}.valor_cm`}
                            render={({ field: f }) => (
                              <Input
                                {...f}
                                type="number" min="0" step="0.1"
                                onChange={e => f.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                placeholder="0"
                                className="h-8 border-slate-200 rounded text-xs text-center"
                              />
                            )}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Controller
                            control={form.control}
                            name={`medidas.${idx}.tolerancia`}
                            render={({ field: f }) => (
                              <Input
                                {...f}
                                type="number" min="0" step="0.1"
                                onChange={e => f.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                placeholder="±0"
                                className="h-8 border-slate-200 rounded text-xs text-center"
                              />
                            )}
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            type="button" variant="ghost" size="icon"
                            onClick={() => remove(idx)}
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ACCIONES ── */}
        <div className="flex items-center justify-end gap-4 sticky bottom-6 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-lg">
          <Button
            type="button" variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="h-11 px-6 font-bold uppercase rounded-xl gap-2"
          >
            <ArrowLeft size={15} /> Cancelar
          </Button>
          <Button
            type="submit"
            form={`${formId}-ficha-tecnica`}
            disabled={isSubmitting}
            className="h-11 px-8 bg-slate-900 hover:bg-slate-800 font-bold uppercase rounded-xl gap-2 text-white"
          >
            {isSubmitting
              ? <><Loader2 size={15} className="animate-spin" /> Guardando...</>
              : <><Save size={15} /> Crear Ficha Técnica</>
            }
          </Button>
        </div>

      </form>
    </Form>
  );
}
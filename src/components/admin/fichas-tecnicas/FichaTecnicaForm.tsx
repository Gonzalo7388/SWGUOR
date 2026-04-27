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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  FormField, FormControl, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import PdfUploadExtractor from '@/components/admin/common/PdfUploadExtractor';

// Schemas
const medidaSchema = z.object({
  punto_medida: z.string().min(1, 'Punto de medida requerido'),
  talla: z.string().min(1, 'Talla requerida'),
  valor_cm: z.number().nonnegative().optional(),
  tolerancia: z.number().nonnegative().optional(),
});

const fichaTecnicaSchema = z.object({
  producto_id: z.string().min(1, 'Producto es requerido'),
  version: z.string().min(1).optional(),
  descripcion_detallada: z.string().optional(),
  sam_total: z.number().nonnegative().optional(),
  costo_estimado: z.number().nonnegative().optional(),
  medidas: z.array(medidaSchema).min(1, 'Debe haber al menos una medida'),
});

type FichaTecnicaInput = z.infer<typeof fichaTecnicaSchema>;

export function FichaTecnicaForm({ productos }: { productos?: any[] }) {
  const router = useRouter();
  const formId = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FichaTecnicaInput>({
    resolver: zodResolver(fichaTecnicaSchema),
    defaultValues: {
      producto_id: '',
      version: '1.0',
      descripcion_detallada: '',
      sam_total: undefined,
      costo_estimado: undefined,
      medidas: [{ punto_medida: '', talla: '', valor_cm: undefined, tolerancia: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'medidas',
  });

  // Manejar extracción de PDF
  const handlePdfExtracted = (data: any) => {
    if (data.producto_nombre) {
      // Intentar buscar el producto por nombre
      const producto = productos?.find(p =>
        p.nombre.toLowerCase().includes(data.producto_nombre.toLowerCase())
      );
      if (producto) {
        form.setValue('producto_id', producto.id.toString());
      }
    }

    if (data.version) form.setValue('version', data.version);
    if (data.descripcion) form.setValue('descripcion_detallada', data.descripcion);
    if (data.sam_total) form.setValue('sam_total', Number(data.sam_total));
    if (data.costo_estimado) form.setValue('costo_estimado', Number(data.costo_estimado));

    // Reemplazar medidas si vienen del PDF
    if (data.medidas && Array.isArray(data.medidas) && data.medidas.length > 0) {
      // Limpiar medidas previas
      while (fields.length > 0) {
        remove(0);
      }
      // Agregar nuevas medidas
      data.medidas.forEach((m: any) => {
        append({
          punto_medida: m.punto_medida || '',
          talla: m.talla || '',
          valor_cm: m.valor_cm ? Number(m.valor_cm) : undefined,
          tolerancia: m.tolerancia ? Number(m.tolerancia) : undefined,
        });
      });
      toast.success(`Se extrajeron ${data.medidas.length} puntos de medida`);
    }
  };

  const onSubmit = async (data: FichaTecnicaInput) => {
    try {
      setIsSubmitting(true);

      const res = await fetch('/api/admin/fichas-tecnicas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producto_id: Number(data.producto_id),
          version: data.version,
          descripcion_detallada: data.descripcion_detallada || null,
          sam_total: data.sam_total || null,
          costo_estimado: data.costo_estimado || null,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Error al crear ficha técnica');
      }

      // Guardar medidas
      if (data.medidas.length > 0 && result.data?.id) {
        const medidasRes = await fetch('/api/admin/ficha-medidas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ficha_id: result.data.id,
            medidas: data.medidas,
          }),
        });

        if (!medidasRes.ok) {
          toast.warning('Ficha creada pero hubo error al guardar medidas');
        }
      }

      toast.success('Ficha técnica registrada correctamente');
      router.push('/admin/Panel-Administrativo/fichas-tecnicas');
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar la ficha técnica');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tallasUnicas = new Set(
    form.watch('medidas').map(m => m.talla).filter(Boolean)
  );

  return (
    <Form {...form}>
      <form
        id={`${formId}-ficha-tecnica`}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* ────────────────────────────────── EXTRACCIÓN PDF ─────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-blue-600 rounded-full" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Cargar Ficha Técnica desde PDF
            </h2>
          </div>

          <p className="text-sm text-slate-500">
            Sube un PDF de ficha técnica para extraer automáticamente medidas, materiales y especificaciones
          </p>

          <PdfUploadExtractor
            extractType="ficha_tecnica"
            label="Cargar PDF de Ficha Técnica"
            description="Arrastra el PDF de la ficha técnica o haz clic para seleccionar"
            onExtract={handlePdfExtracted}
          />

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs text-blue-700 font-semibold">
              💡 <strong>Tip:</strong> La IA extraerá automáticamente puntos de medida y especificaciones. Puedes editar o agregar más después.
            </p>
          </div>
        </div>

        {/* ────────────────────────────────── DATOS BÁSICOS ──────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-slate-900 rounded-full" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Información General
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      className="h-10 border border-slate-200 rounded-xl text-sm px-3 bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
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

            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Versión
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="1.0"
                      className="h-10 border-slate-200 rounded-xl text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        type="number"
                        min="0"
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
                        type="number"
                        min="0"
                        step="0.01"
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
        </div>

        {/* ────────────────────────────────── MEDIDAS ─────────────────────────────────────── */}
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
                Sin medidas agregadas
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
                    <th className="text-center py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Acciones</th>
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
                            <Input
                              {...f}
                              placeholder="Ej. Largo, Ancho..."
                              className="h-8 border-slate-200 rounded text-xs"
                            />
                          )}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Controller
                          control={form.control}
                          name={`medidas.${idx}.talla`}
                          render={({ field: f }) => (
                            <Input
                              {...f}
                              placeholder="Ej. XS, S, M..."
                              className="h-8 border-slate-200 rounded text-xs text-center"
                            />
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
                              type="number"
                              min="0"
                              step="0.1"
                              onChange={(e) => f.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
                              type="number"
                              min="0"
                              step="0.1"
                              onChange={(e) => f.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="±0"
                              className="h-8 border-slate-200 rounded text-xs text-center"
                            />
                          )}
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
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

          <FormMessage className="text-red-500" />
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
            form={`${formId}-ficha-tecnica`}
            disabled={isSubmitting}
            className="h-11 px-8 bg-slate-900 hover:bg-slate-800 font-bold uppercase rounded-xl gap-2 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Save size={15} /> Crear Ficha Técnica
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

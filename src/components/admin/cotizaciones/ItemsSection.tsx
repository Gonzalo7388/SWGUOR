'use client';

import { UseFormReturn, useFieldArray, Controller } from 'react-hook-form';
import { Plus, Trash2, PackagePlus } from 'lucide-react';
import { Button }    from '@/components/ui/button';
import { Input }     from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { CreateCotizacionInput } from '@/lib/schemas/cotizaciones';

const ERP_LABEL = 'text-[10px] font-black text-slate-500 uppercase tracking-wider';

const ITEM_DEFAULTS = {
  producto_id:          '',
  variante_id:          '',
  cantidad:             1,
  precio_unitario:      0,
  color_snapshot:       '',
  talla_snapshot:       '',
  modelo_snapshot:      null,
  prenda_tipo_snapshot: null,
} as const;

interface ItemsSectionProps {
  form:           UseFormReturn<CreateCotizacionInput>;
  productos:      { id: number; nombre: string; sku: string; precio: number }[];
  simboloMoneda:  string;
}

export function ItemsSection({ form, productos, simboloMoneda }: ItemsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name:    'items',
  });

  // ── Al seleccionar un producto, pre-rellenar precio del catálogo ───────────
  const handleProductoChange = (index: number, productoId: string) => {
    form.setValue(`items.${index}.producto_id`, productoId);
    const producto = productos.find((p) => p.id.toString() === productoId);
    if (producto?.precio) {
      form.setValue(`items.${index}.precio_unitario`, producto.precio);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-blue-600 rounded-full" />
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            Productos / Ítems
          </h2>
          {fields.length > 0 && (
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-black rounded-full">
              {fields.length}
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 text-xs font-bold uppercase rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={() => append({ ...ITEM_DEFAULTS })}
        >
          <Plus size={14} /> Agregar Producto
        </Button>
      </div>

      <Separator className="bg-slate-100" />

      {/* ── Estado vacío ── */}
      {fields.length === 0 ? (
        <div
          className="text-center py-14 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
          onClick={() => append({ ...ITEM_DEFAULTS })}
        >
          <PackagePlus className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
            Sin productos agregados
          </p>
          <p className="text-[10px] text-slate-300 font-bold mt-1">
            Haz clic aquí o en &ldquo;Agregar Producto&rdquo; para comenzar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const cantidad       = form.watch(`items.${index}.cantidad`)       ?? 0;
            const precioUnitario = form.watch(`items.${index}.precio_unitario`) ?? 0;
            const subtotal       = cantidad * precioUnitario;

            return (
              <div
                key={field.id}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3"
              >
                {/* Fila 1: Producto + Talla + Color */}
                <div className="grid grid-cols-12 gap-3 items-end">
                  {/* Producto */}
                  <div className="col-span-5">
                    <Controller
                      control={form.control}
                      name={`items.${index}.producto_id`}
                      render={({ field: f, fieldState }) => (
                        <FormItem>
                          <FormLabel className={ERP_LABEL}>Producto *</FormLabel>
                          <Select
                            onValueChange={(v) => handleProductoChange(index, v)}
                            value={f.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 border-slate-200 rounded-xl text-xs">
                                <SelectValue placeholder="Seleccionar producto..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {productos.map((p) => (
                                <SelectItem key={p.id} value={p.id.toString()}>
                                  {p.nombre} ({p.sku})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {fieldState.error && (
                            <p className="text-[10px] text-red-500 font-bold">
                              {fieldState.error.message}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Talla */}
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.talla_snapshot`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className={ERP_LABEL}>Talla</FormLabel>
                          <FormControl>
                            <Input {...f} className="h-10 border-slate-200 rounded-xl text-xs" placeholder="S, M, L..." />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Color */}
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.color_snapshot`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className={ERP_LABEL}>Color</FormLabel>
                          <FormControl>
                            <Input {...f} className="h-10 border-slate-200 rounded-xl text-xs" placeholder="Rojo, azul..." />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Modelo */}
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.modelo_snapshot`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className={ERP_LABEL}>Modelo</FormLabel>
                          <FormControl>
                            <Input
                              {...f}
                              value={f.value ?? ''}
                              className="h-10 border-slate-200 rounded-xl text-xs"
                              placeholder="Opcional"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Fila 2: Cantidad + Precio + Subtotal + Eliminar */}
                <div className="grid grid-cols-12 gap-3 items-end">
                  {/* Cantidad */}
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.cantidad`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className={ERP_LABEL}>Cantidad *</FormLabel>
                          <FormControl>
                            <Input
                              type="number" min={1}
                              {...f}
                              onChange={(e) => f.onChange(Number(e.target.value))}
                              className="h-10 border-slate-200 rounded-xl text-xs"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Precio unitario */}
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.precio_unitario`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className={ERP_LABEL}>Precio unitario *</FormLabel>
                          <FormControl>
                            <Input
                              type="number" step="0.01" min={0.01}
                              {...f}
                              onChange={(e) => f.onChange(Number(e.target.value))}
                              className="h-10 border-slate-200 rounded-xl text-xs"
                              placeholder="0.00"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Tipo de prenda */}
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.prenda_tipo_snapshot`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className={ERP_LABEL}>Tipo prenda</FormLabel>
                          <FormControl>
                            <Input
                              {...f}
                              value={f.value ?? ''}
                              className="h-10 border-slate-200 rounded-xl text-xs"
                              placeholder="Polo, pantalón..."
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Subtotal display */}
                  <div className="col-span-3 flex items-end gap-2">
                    <div className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                      <p className="text-[9px] font-black uppercase text-slate-400">Subtotal</p>
                      <p className="text-sm font-black text-slate-900">
                        {simboloMoneda} {subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl shrink-0"
                      onClick={() => remove(index)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Error global del array */}
          {form.formState.errors.items?.message && (
            <p className="text-xs text-red-500 font-bold text-center py-3 bg-red-50 rounded-xl border border-red-200">
              {form.formState.errors.items.message}
            </p>
          )}

          {/* Total acumulado */}
          <div className="flex justify-end pt-2">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-3 text-right">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total ítems</p>
              <p className="text-xl font-black text-blue-700">
                {simboloMoneda}{' '}
                {fields.reduce((sum, _, i) => {
                  const c = form.getValues(`items.${i}.cantidad`)       ?? 0;
                  const p = form.getValues(`items.${i}.precio_unitario`) ?? 0;
                  return sum + c * p;
                }, 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
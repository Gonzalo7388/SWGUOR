'use client';

import { UseFormReturn, useFieldArray, Controller } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
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
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { CreateCotizacionInput } from '@/lib/schemas/cotizaciones';

const ERP_LABEL =
  'text-[10px] font-black text-slate-500 uppercase tracking-wider';

interface ItemsSectionProps {
  form: UseFormReturn<CreateCotizacionInput>;
  productos: { id: number; nombre: string; sku: string }[];
  simboloMoneda: string;
}

export function ItemsSection({
  form,
  productos,
  simboloMoneda,
}: ItemsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-blue-600 rounded-full" />
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            Productos / Ítems
          </h2>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 text-xs font-bold uppercase rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={() =>
            append({ producto_id: '', cantidad: 1, precio_unitario: 0 })
          }
        >
          <Plus size={14} />
          Agregar Producto
        </Button>
      </div>

      <Separator className="bg-slate-200" />

      {fields.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            No hay productos agregados
          </p>
          <p className="text-[10px] text-slate-300 font-bold mt-1">
            Haga clic en &quot;Agregar Producto&quot; para comenzar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-12 gap-4 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100"
            >
              {/* Producto */}
              <div className="col-span-5">
                <Controller
                  control={form.control}
                  name={`items.${index}.producto_id`}
                  render={({
                    field: ctrlField,
                    fieldState,
                  }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>Producto</FormLabel>
                      <Select
                        onValueChange={ctrlField.onChange}
                        value={ctrlField.value}
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

              {/* Cantidad */}
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name={`items.${index}.cantidad`}
                  render={({ field: ctrlField }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>Cantidad</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...ctrlField}
                          onChange={(e) =>
                            ctrlField.onChange(Number(e.target.value))
                          }
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
                  render={({ field: ctrlField }) => (
                    <FormItem>
                      <FormLabel className={ERP_LABEL}>Precio Unit.</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min={0.01}
                          {...ctrlField}
                          onChange={(e) =>
                            ctrlField.onChange(Number(e.target.value))
                          }
                          className="h-10 border-slate-200 rounded-xl text-xs"
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Subtotal + remove */}
              <div className="col-span-2 flex items-end gap-2">
                <div className="flex-1 text-right">
                  <p className="text-[9px] font-black uppercase text-slate-400">
                    Subtotal
                  </p>
                  <p className="text-base font-black text-slate-900">
                    {simboloMoneda}{' '}
                    {(
                      (form.watch(`items.${index}.cantidad`) ?? 0) *
                      (form.watch(`items.${index}.precio_unitario`) ?? 0)
                    ).toLocaleString('es-PE', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl shrink-0"
                  onClick={() => remove(index)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}

          {/* Items array error */}
          {form.formState.errors.items && (
            <p className="text-xs text-red-500 font-bold text-center py-3 bg-red-50 rounded-xl border border-red-200">
              {form.formState.errors.items.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

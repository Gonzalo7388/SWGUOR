'use client';

import { Trash2 } from 'lucide-react';
import { useFormContext, type Control } from 'react-hook-form';
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { SearchableDropdown } from '@/components/ui/searchable-dropdown';
import {
  LABEL_TIPO_IMPUESTO_OC,
  TIPO_IMPUESTO_OC,
} from '@/lib/constants/ordenes-compra';

const SELECT_TRIGGER_CLASS =
  'w-full min-w-0 max-w-full [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:block';

interface ItemCatalogo {
  id: number;
  nombre: string;
}

interface ItemFormSlice {
  tipo?: 'material' | 'insumo';
  ref_id?: string;
  notas?: string;
}

interface Props {
  index: number;
  control: Control<any>;
  materiales: ItemCatalogo[];
  insumos: ItemCatalogo[];
  watchedItem?: ItemFormSlice;
  canRemove: boolean;
  onRemove: () => void;
}

export function OrdenCompraItemRow({
  index,
  control,
  materiales,
  insumos,
  watchedItem,
  canRemove,
  onRemove,
}: Props) {
  const { setValue } = useFormContext();
  const tipo = watchedItem?.tipo ?? 'insumo';
  const opciones = tipo === 'material' ? materiales : insumos;

  const productoOptions = opciones.map((o) => ({
    value: String(o.id),
    label: o.nombre,
    keywords: String(o.id),
  }));

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-4 min-w-0">
      <div className="flex items-start gap-2 min-w-0">
        <FormField
          control={control}
          name={`items.${index}.ref_id`}
          render={({ field: f }) => (
            <FormItem className="flex-1 min-w-0">
              <FormLabel>Producto</FormLabel>
              <FormControl>
                <SearchableDropdown
                  options={productoOptions}
                  value={f.value}
                  onChange={f.onChange}
                  placeholder="Buscar producto..."
                  searchPlaceholder="Nombre del insumo o material..."
                  emptyMessage="No se encontró el producto"
                />
              </FormControl>
              {watchedItem?.notas && !f.value && (
                <p
                  className="text-xs text-amber-600 line-clamp-2 break-words"
                  title={watchedItem.notas}
                >
                  PDF: {watchedItem.notas}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 mt-8 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="Eliminar ítem"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-0">
        <FormField
          control={control}
          name={`items.${index}.tipo`}
          render={({ field: f }) => (
            <FormItem className="min-w-0">
              <FormLabel>Tipo</FormLabel>
              <Select
                value={f.value}
                onValueChange={(v) => {
                  f.onChange(v);
                  setValue(`items.${index}.ref_id`, '');
                }}
              >
                <FormControl>
                  <SelectTrigger className={SELECT_TRIGGER_CLASS}>
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
          control={control}
          name={`items.${index}.cantidad_pedida`}
          render={({ field: f }) => (
            <FormItem className="min-w-0">
              <FormLabel>Cantidad</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full min-w-0"
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
          control={control}
          name={`items.${index}.precio_unitario`}
          render={({ field: f }) => (
            <FormItem className="min-w-0">
              <FormLabel>P. unit.</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full min-w-0"
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
          control={control}
          name={`items.${index}.tipo_impuesto`}
          render={({ field: f }) => (
            <FormItem className="min-w-0">
              <FormLabel>Impuesto</FormLabel>
              <Select value={f.value} onValueChange={f.onChange}>
                <FormControl>
                  <SelectTrigger className={SELECT_TRIGGER_CLASS}>
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
      </div>
    </div>
  );
}

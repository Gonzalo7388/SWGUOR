"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  confeccionSchema,
  ConfeccionFormValues,
  PRIORIDAD_CONFECCION,
  PRIORIDAD_LABELS,
} from "@/lib/schemas/confecciones";
import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input }    from "@/components/ui/input";
import { Button }   from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ConfeccionFormProps {
  talleres:         { id: string | number; nombre: string }[];
  onSubmit:         (values: ConfeccionFormValues) => void;
  isLoading?:       boolean;
  defaultPedidoId?: number;
}

export function ConfeccionForm({
  talleres, onSubmit, isLoading = false, defaultPedidoId,
}: ConfeccionFormProps) {
  const form = useForm<ConfeccionFormValues>({
    resolver: zodResolver(confeccionSchema),
    defaultValues: {
      pedido_id:      defaultPedidoId ?? (undefined as unknown as number),
      taller_id:      "",
      prenda:         "",
      cantidad:       1,
      costo_unitario: undefined,
      prioridad:      "media",
      estado:         "pendiente",
      fecha_entrega:  "",
      notas:          "",
    },
  });

  const labelClass = "font-bold uppercase text-[10px] italic";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* ── Pedido ID (oculto si viene del contexto) ── */}
          {!defaultPedidoId && (
            <FormField
              control={form.control}
              name="pedido_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>ID de Pedido</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Ej: 42"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* ── Taller ── */}
          <FormField
            control={form.control}
            name="taller_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Taller Asignado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecciona un taller" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {talleres.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ── Prenda ── */}
          <FormField
            control={form.control}
            name="prenda"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Prenda / Modelo</FormLabel>
                <FormControl>
                  <Input {...field} className="h-11" placeholder="Ej: Polo Oversize Black" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ── Cantidad ── */}
          <FormField
            control={form.control}
            name="cantidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Cantidad Unidades</FormLabel>
                <FormControl>
                  <Input
                    type="number" min={1} placeholder="1"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ── Costo unitario ── */}
          <FormField
            control={form.control}
            name="costo_unitario"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Costo Unitario (S/.)</FormLabel>
                <FormControl>
                  <Input
                    type="number" min={0.01} step={0.01} placeholder="0.00"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ── Fecha de entrega ── */}
          <FormField
            control={form.control}
            name="fecha_entrega"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Fecha de Entrega</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-11" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ── Prioridad ── */}
          <FormField
            control={form.control}
            name="prioridad"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Prioridad</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecciona prioridad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRIORIDAD_CONFECCION.map((p) => (
                      <SelectItem key={p} value={p}>
                        {PRIORIDAD_LABELS[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Notas ── */}
        <FormField
          control={form.control}
          name="notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Notas Adicionales</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Detalles de costura, avíos, tallas especiales, etc."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-pink-600 hover:bg-pink-700 h-12 font-bold uppercase italic"
        >
          {isLoading ? (
            <><Loader2 className="animate-spin mr-2 h-4 w-4" />Generando...</>
          ) : (
            "Generar Orden de Producción"
          )}
        </Button>
      </form>
    </Form>
  );
}
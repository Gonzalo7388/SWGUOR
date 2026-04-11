'use client';

import { UseFormReturn } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

interface DatosGeneralesSectionProps {
  form: UseFormReturn<CreateCotizacionInput>;
  clientes: { id: number; razon_social: string | null }[];
}

export function DatosGeneralesSection({
  form,
  clientes,
}: DatosGeneralesSectionProps) {
  const clienteValue = form.watch('cliente_id');
  const mostrarClienteManual =
    !clienteValue || clienteValue === 'none' || clienteValue === '';

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-8 bg-slate-900 rounded-full" />
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
          Datos Generales
        </h2>
      </div>

      {/* ── Cliente ── */}
      <div className="grid grid-cols-1 md:col-span-2 gap-4 border-l-4 border-blue-500 pl-4 bg-blue-50/20 p-4 rounded-r-xl">
        <FormField
          control={form.control}
          name="cliente_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={ERP_LABEL}>
                Cliente Registrado (Opcional)
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-10 border-slate-200 rounded-xl text-xs bg-white">
                    <SelectValue placeholder="Seleccione si existe en el sistema..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">
                    -- NO REGISTRADO (ESCRIBIR MANUAL) --
                  </SelectItem>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.razon_social ?? `Cliente #${c.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {mostrarClienteManual && (
          <FormField
            control={form.control}
            name="nombre_cliente_manual"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={ERP_LABEL}>
                  Nombre Cliente / Empresa Temporal
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-10 border-orange-300 bg-white rounded-xl text-xs focus:ring-orange-500 shadow-sm"
                    placeholder="Escribe el nombre aquí..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      {/* ── Empresa (fijo, solo lectura) ── */}
      <FormField
        control={form.control}
        name="empresa"
        render={() => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Empresa</FormLabel>
            <FormControl>
              <Input
                value="Modas y Estilos Guor S.a.C."
                disabled
                readOnly
                className="h-10 border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="contacto"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Contacto</FormLabel>
            <FormControl>
              <Input
                {...field}
                className="h-10 border-slate-200 rounded-xl text-xs"
                placeholder="Nombre contacto"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tipo_destino"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Tipo Destino</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="h-10 border-slate-200 rounded-xl text-xs">
                  <SelectValue placeholder="Destino..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="nacional">Nacional</SelectItem>
                <SelectItem value="internacional">Internacional</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Vendedor, Tipo Venta, Unidad Negocio, Moneda ── */}
      <FormField
        control={form.control}
        name="vendedor"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Vendedor</FormLabel>
            <FormControl>
              <Input
                {...field}
                className="h-10 border-slate-200 rounded-xl text-xs"
                placeholder="Nombre vendedor"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tipo_venta"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Tipo Venta</FormLabel>
            <FormControl>
              <Input
                {...field}
                className="h-10 border-slate-200 rounded-xl text-xs"
                placeholder="Tipo de venta"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="unidad_negocio"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Unidad Negocio</FormLabel>
            <FormControl>
              <Input
                {...field}
                className="h-10 border-slate-200 rounded-xl text-xs"
                placeholder="Unidad negocio"
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
            <FormLabel className={ERP_LABEL}>Moneda *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="h-10 border-slate-200 rounded-xl text-xs">
                  <SelectValue placeholder="Moneda..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="PEN">PEN - Sol</SelectItem>
                <SelectItem value="USD">USD - Dólar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Forma Pago, Método, Tasa Impuesto, Tipo Operación ── */}
      <FormField
        control={form.control}
        name="forma_pago"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Forma Pago</FormLabel>
            <FormControl>
              <Input
                {...field}
                className="h-10 border-slate-200 rounded-xl text-xs"
                placeholder="Forma de pago"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="metodo"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Método</FormLabel>
            <FormControl>
              <Input
                {...field}
                className="h-10 border-slate-200 rounded-xl text-xs"
                placeholder="Método de pago"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tasa_impuesto"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Tasa Impuesto</FormLabel>
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

      <FormField
        control={form.control}
        name="tipo_operacion"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Tipo Operación</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="h-10 border-slate-200 rounded-xl text-xs">
                  <SelectValue placeholder="Operación..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Venta interna">Venta interna</SelectItem>
                <SelectItem value="Exportación">Exportación</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Dirección Entrega, Dirección Factura, Condición Entrega, Tiempo Entrega ── */}
      <FormField
        control={form.control}
        name="direccion_entrega"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Dirección Entrega</FormLabel>
            <FormControl>
              <Input
                {...field}
                className="h-10 border-slate-200 rounded-xl text-xs"
                placeholder="Dirección de entrega"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="direccion_factura"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Dirección Factura</FormLabel>
            <FormControl>
              <Input
                {...field}
                className="h-10 border-slate-200 rounded-xl text-xs"
                placeholder="Dirección factura"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="condicion_entrega"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Condición Entrega</FormLabel>
            <FormControl>
              <Input
                {...field}
                className="h-10 border-slate-200 rounded-xl text-xs"
                placeholder="Condición entrega"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tiempo_entrega"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Tiempo Entrega</FormLabel>
            <FormControl>
              <Input
                {...field}
                className="h-10 border-slate-200 rounded-xl text-xs"
                placeholder="Ej: 15 días hábiles"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Idioma, Referencia, Probabilidad, Fecha Cierre ── */}
      <FormField
        control={form.control}
        name="idioma"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Idioma</FormLabel>
            <FormControl>
              <Input
                {...field}
                className="h-10 border-slate-200 rounded-xl text-xs"
                placeholder="Idioma cotización"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="referencia"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Referencia</FormLabel>
            <FormControl>
              <Input
                {...field}
                className="h-10 border-slate-200 rounded-xl text-xs"
                placeholder="Referencia externa"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="probabilidad"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Probabilidad</FormLabel>
            <FormControl>
              <Input
                {...field}
                className="h-10 border-slate-200 rounded-xl text-xs"
                placeholder="Ej: 75%"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fecha_cierre"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Fecha Cierre</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                className="h-10 border-slate-200 rounded-xl text-xs"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Válida Hasta, Notas ── */}
      <FormField
        control={form.control}
        name="valida_hasta"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Válida Hasta *</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                className="h-10 border-slate-200 rounded-xl text-xs"
                min={new Date().toISOString().split('T')[0]}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="md:col-span-3">
        <FormField
          control={form.control}
          name="notas_internas"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={ERP_LABEL}>Notas Internas</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="min-h-[80px] border-slate-200 rounded-xl text-xs resize-none"
                  placeholder="Observaciones, condiciones comerciales, descuentos especiales..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

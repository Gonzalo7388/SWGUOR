'use client';

import { UseFormReturn } from 'react-hook-form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input }    from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FormField, FormControl, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import type { CreateCotizacionInput } from '@/lib/schemas/cotizaciones';

const ERP_LABEL = 'text-[10px] font-black text-slate-500 uppercase tracking-wider';

// ── Sección con línea de color lateral ──────────────────────────────────────
function SectionBlock({
  color, title, children,
}: {
  color: string; title: string; children: React.ReactNode;
}) {
  return (
    <div className={`border-l-4 ${color} pl-4 space-y-4`}>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      {children}
    </div>
  );
}

interface DatosGeneralesSectionProps {
  form:     UseFormReturn<CreateCotizacionInput>;
  clientes: { id: number; razon_social: string | null; ruc: string }[];
}

export function DatosGeneralesSection({ form, clientes }: DatosGeneralesSectionProps) {
  const clienteValue         = form.watch('cliente_id');
  const mostrarClienteManual = !clienteValue || clienteValue === 'none' || clienteValue === '';

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 bg-slate-900 rounded-full" />
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
          Datos Generales
        </h2>
      </div>

      {/* ── Bloque 1: Cliente ───────────────────────────────────────────── */}
      <SectionBlock color="border-blue-500" title="Identificación del cliente">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cliente_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={ERP_LABEL}>Cliente registrado (opcional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-10 border-slate-200 rounded-xl text-xs bg-white">
                      <SelectValue placeholder="Seleccione si existe en el sistema..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">— No registrado (escribir manual) —</SelectItem>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.razon_social ?? `Cliente #${c.id}`}
                        {c.ruc ? ` · ${c.ruc}` : ''}
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
                  <FormLabel className={ERP_LABEL}>Nombre cliente / empresa temporal</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-10 border-orange-300 bg-white rounded-xl text-xs focus:ring-orange-500"
                      placeholder="Escribe el nombre aquí..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </SectionBlock>

      {/* ── Bloque 2: Datos comerciales ─────────────────────────────────── */}
      <SectionBlock color="border-slate-400" title="Datos comerciales">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="empresa"
            render={() => (
              <FormItem>
                <FormLabel className={ERP_LABEL}>Empresa</FormLabel>
                <FormControl>
                  <Input
                    value="Modas y Estilos Guor S.a.C."
                    disabled readOnly
                    className="h-10 border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </FormControl>
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
                  <Input {...field} className="h-10 border-slate-200 rounded-xl text-xs" placeholder="Nombre del contacto" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vendedor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={ERP_LABEL}>Vendedor</FormLabel>
                <FormControl>
                  <Input {...field} className="h-10 border-slate-200 rounded-xl text-xs" placeholder="Nombre vendedor" />
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
                <FormLabel className={ERP_LABEL}>Tipo destino</FormLabel>
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

          <FormField
            control={form.control}
            name="tipo_venta"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={ERP_LABEL}>Tipo venta</FormLabel>
                <FormControl>
                  <Input {...field} className="h-10 border-slate-200 rounded-xl text-xs" placeholder="Tipo de venta" />
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
                <FormLabel className={ERP_LABEL}>Unidad negocio</FormLabel>
                <FormControl>
                  <Input {...field} className="h-10 border-slate-200 rounded-xl text-xs" placeholder="Unidad de negocio" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </SectionBlock>

      {/* ── Bloque 3: Condiciones financieras ───────────────────────────── */}
      <SectionBlock color="border-emerald-500" title="Condiciones financieras">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <SelectItem value="PEN">PEN — Sol peruano</SelectItem>
                    <SelectItem value="USD">USD — Dólar</SelectItem>
                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tasa_impuesto"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={ERP_LABEL}>Tasa impuesto</FormLabel>
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
                <FormLabel className={ERP_LABEL}>Tipo operación</FormLabel>
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

          <FormField
            control={form.control}
            name="forma_pago"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={ERP_LABEL}>Forma pago</FormLabel>
                <FormControl>
                  <Input {...field} className="h-10 border-slate-200 rounded-xl text-xs" placeholder="Ej: Contado, crédito 30d" />
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
                <FormLabel className={ERP_LABEL}>Método de pago</FormLabel>
                <FormControl>
                  <Input {...field} className="h-10 border-slate-200 rounded-xl text-xs" placeholder="Transferencia, efectivo..." />
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
                <FormLabel className={ERP_LABEL}>Probabilidad cierre</FormLabel>
                <FormControl>
                  <Input {...field} className="h-10 border-slate-200 rounded-xl text-xs" placeholder="Ej: 75%" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </SectionBlock>

      {/* ── Bloque 4: Logística ─────────────────────────────────────────── */}
      <SectionBlock color="border-amber-400" title="Logística y entrega">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="direccion_entrega"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={ERP_LABEL}>Dirección entrega</FormLabel>
                <FormControl>
                  <Input {...field} className="h-10 border-slate-200 rounded-xl text-xs" placeholder="Dirección de entrega" />
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
                <FormLabel className={ERP_LABEL}>Dirección factura</FormLabel>
                <FormControl>
                  <Input {...field} className="h-10 border-slate-200 rounded-xl text-xs" placeholder="Dirección de facturación" />
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
                <FormLabel className={ERP_LABEL}>Condición entrega</FormLabel>
                <FormControl>
                  <Input {...field} className="h-10 border-slate-200 rounded-xl text-xs" placeholder="Ej: CIF, FOB, DDP" />
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
                <FormLabel className={ERP_LABEL}>Tiempo entrega</FormLabel>
                <FormControl>
                  <Input {...field} className="h-10 border-slate-200 rounded-xl text-xs" placeholder="Ej: 15 días hábiles" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </SectionBlock>

      {/* ── Bloque 5: Vigencia y referencias ────────────────────────────── */}
      <SectionBlock color="border-violet-500" title="Vigencia y referencias">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="valida_hasta"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={ERP_LABEL}>Válida hasta *</FormLabel>
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

          <FormField
            control={form.control}
            name="fecha_cierre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={ERP_LABEL}>Fecha cierre estimada</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-10 border-slate-200 rounded-xl text-xs" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="idioma"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={ERP_LABEL}>Idioma</FormLabel>
                <FormControl>
                  <Input {...field} className="h-10 border-slate-200 rounded-xl text-xs" placeholder="Español, English..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="referencia"
            render={({ field }) => (
              <FormItem className="md:col-span-3">
                <FormLabel className={ERP_LABEL}>Referencia externa</FormLabel>
                <FormControl>
                  <Input {...field} className="h-10 border-slate-200 rounded-xl text-xs" placeholder="Número de solicitud, pedido del cliente..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </SectionBlock>

      {/* ── Notas internas ─────────────────────────────────────────────── */}
      <FormField
        control={form.control}
        name="notas_internas"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={ERP_LABEL}>Notas internas</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                className="min-h-[80px] border-slate-200 rounded-xl text-xs resize-none"
                placeholder="Observaciones, condiciones comerciales especiales, descuentos..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
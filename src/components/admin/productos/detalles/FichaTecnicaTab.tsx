"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Save, Loader2, FileText, Lock, Calculator, Plus, Layers, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFichaDetalle } from '@/lib/hooks/useFichaDetalle';
import { useMateriales } from '@/lib/hooks/useMateriales';
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const FIELD_LABEL = "text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] block mb-1.5";
const FIELD_INPUT  = "bg-gray-50 border-gray-200 h-11 rounded-lg text-sm font-medium text-gray-800 focus-visible:ring-2 focus-visible:ring-pink-300 transition-all placeholder:text-gray-300";

interface FichaTecnicaTabProps {
  producto:   any;
  ficha:      any | null;
  canEdit:    boolean;
  isLoading?: boolean;
  onCreate:   (data: any) => void;
  onUpdate:   (id: string, data: any) => void;
}

export function FichaTecnicaTab({ producto, ficha, canEdit, isLoading = false, onCreate, onUpdate }: FichaTecnicaTabProps) {

  const { detalles, save: saveDetalle, isSaving } = useFichaDetalle(ficha?.id);
  const { materiales } = useMateriales();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (detalles) setItems(detalles);
  }, [detalles]);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      version: ficha?.version ?? "1.0",
      descripcion_detallada: ficha?.descripcion_detallada ?? "",
      sam_total: ficha?.sam_total ?? "",
      costo_estimado: ficha?.costo_estimado ?? "",
      ficha_url: ficha?.ficha_url ?? "",
      imagen_geometral: ficha?.imagen_geometral ?? "",
    },
  });

  // Cálculo de costo dinámico
  const costoTotalMateriales = items.reduce((acc, item) => {
    const mat = materiales.find(m => String(m.id) === String(item.material_id));
    const precio = Number(mat?.precio_unitario || 0);
    const desperdicio = 1 + (Number(item.porcentaje_desperdicio || 0) / 100);
    return acc + (precio * Number(item.cantidad_consumo || 0) * desperdicio);
  }, 0);

  const onSubmit = async (data: any) => {
    // Primero guardamos la cabecera
    if (!ficha?.id) {
      await onCreate({ producto_id: producto.id, ...data });
    } else {
      await onUpdate(ficha.id, data);
      // Luego guardamos los materiales si ya existe la ficha
      await saveDetalle(items);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-emerald-500 rounded-full" />
          <div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
              Ficha técnica de producción
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {ficha?.id ? `Versión ${ficha.version} · ${ficha.estado}` : "Sin ficha registrada"}
            </p>
          </div>
        </div>
        {!canEdit && (
          <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase">
            <Lock size={12} /> Solo lectura
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-5">

          {/* Descripción */}
          <div className="col-span-2">
            <Label className={FIELD_LABEL}>Descripción detallada</Label>
            <Textarea
              {...register("descripcion_detallada")}
              disabled={!canEdit}
              className="bg-gray-50 border-gray-200 rounded-lg text-sm min-h-[100px] focus-visible:ring-2 focus-visible:ring-pink-300 disabled:opacity-60"
              placeholder="Detalles de confección, materiales y acabados..."
            />
          </div>

          {/* SAM */}
          <div>
            <Label className={FIELD_LABEL}>SAM total (minutos)</Label>
            <Input
              type="number"
              step="0.01"
              {...register("sam_total")}
              disabled={!canEdit}
              className={FIELD_INPUT}
              placeholder="Ej. 12.5"
            />
          </div>

          {/* Costo estimado */}
          <div>
            <Label className={FIELD_LABEL}>Costo estimado (S/.)</Label>
            <Input
              type="number"
              step="0.01"
              {...register("costo_estimado")}
              disabled={!canEdit}
              className={FIELD_INPUT}
              placeholder="0.00"
            />
          </div>

          {/* Versión */}
          <div>
            <Label className={FIELD_LABEL}>Versión</Label>
            <Input
              {...register("version")}
              disabled={!canEdit}
              className={FIELD_INPUT}
              placeholder="1.0"
            />
          </div>

          {/* URL Ficha PDF */}
          <div>
            <Label className={FIELD_LABEL}>URL Ficha PDF</Label>
            <Input
              {...register("ficha_url")}
              disabled={!canEdit}
              className={FIELD_INPUT}
              placeholder="https://..."
            />
          </div>

          {/* Imagen geometral */}
          <div className="col-span-2">
            <Label className={FIELD_LABEL}>URL imagen geometral</Label>
            <Input
              {...register("imagen_geometral")}
              disabled={!canEdit}
              className={FIELD_INPUT}
              placeholder="https://..."
            />
          </div>

          {/* Preview imagen geometral */}
          {ficha?.imagen_geometral && (
            <div className="col-span-2">
              <Label className={FIELD_LABEL}>Vista previa geometral</Label>
              <img
                src={ficha.imagen_geometral}
                alt="Imagen geometral"
                className="rounded-lg border border-gray-100 max-h-48 object-contain bg-gray-50 p-2"
              />
            </div>
          )}

          {/* Preview PDF */}
          {ficha?.ficha_url && (
            <div className="col-span-2">
                href={ficha.ficha_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 transition-colors"
                <FileText size={14} />
                Ver ficha técnica PDF
            </div>
          )}
        </div>

        {/* Detalle de Materiales */}

        {ficha?.id && (
             <div className="mt-8 space-y-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Layers className="text-pink-500 w-4 h-4" />
                   <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-widest">
                     Consumos y Materiales
                   </h4>
                 </div>
                 {canEdit && (
                   <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-7 font-bold uppercase"
                    onClick={() => setItems([...items, { material_id: '', cantidad_consumo: 0, porcentaje_desperdicio: 5 }])}
                   >
                     <Plus className="w-3 h-3 mr-1" /> Añadir Material
                   </Button>
                 )}
               </div>

               <div className="border rounded-lg overflow-hidden">
                 <Table>
                   <TableHeader className="bg-gray-50">
                     <TableRow>
                       <TableHead className="text-[10px] font-bold">Material</TableHead>
                       <TableHead className="text-[10px] font-bold">Cantidad</TableHead>
                       <TableHead className="text-[10px] font-bold">% Desp.</TableHead>
                       <TableHead className="text-[10px] font-bold text-right">Subtotal</TableHead>
                       <TableHead className="w-[40px]"></TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {items.map((item, index) => (
                       <TableRow key={index} className="hover:bg-gray-50/50">
                         <TableCell>
                           <select 
                             disabled={!canEdit}
                             className="w-full bg-transparent text-xs font-medium focus:outline-none"
                             value={item.material_id || ''}
                             onChange={(e) => {
                               const n = [...items];
                               n[index].material_id = e.target.value;
                               setItems(n);
                             }}
                           >
                             <option value="">Seleccionar...</option>
                             {materiales.map(m => (
                               <option key={m.id} value={m.id}>{m.nombre} - {m.color}</option>
                             ))}
                           </select>
                         </TableCell>
                         <TableCell>
                           <input
                             type="number"
                             disabled={!canEdit}
                             className="w-16 bg-transparent text-xs font-mono focus:outline-none"
                             value={item.cantidad_consumo}
                             onChange={(e) => {
                               const n = [...items];
                               n[index].cantidad_consumo = e.target.value;
                               setItems(n);
                             }}
                           />
                         </TableCell>
                         <TableCell>
                           <input
                             type="number"
                             disabled={!canEdit}
                             className="w-12 bg-transparent text-xs font-mono focus:outline-none text-gray-400"
                             value={item.porcentaje_desperdicio}
                             onChange={(e) => {
                               const n = [...items];
                               n[index].porcentaje_desperdicio = e.target.value;
                               setItems(n);
                             }}
                           />
                         </TableCell>
                         <TableCell className="text-right text-xs font-bold text-gray-600">
                           S/ {(Number(materiales.find(m => String(m.id) === String(item.material_id))?.precio_unitario || 0) * Number(item.cantidad_consumo)).toFixed(2)}
                         </TableCell>
                         <TableCell>
                           {canEdit && (
                             <button type="button" onClick={() => setItems(items.filter((_, i) => i !== index))}>
                               <Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-500 transition-colors" />
                             </button>
                           )}
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </div>
               
               {/* Resumen de Costos */}
               <div className="flex justify-end">
                 <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex items-center gap-4">
                   <div className="flex items-center gap-1.5 text-gray-400">
                     <Calculator size={14} />
                     <span className="text-[10px] font-bold uppercase tracking-tight">Costo Materiales:</span>
                   </div>
                   <span className="text-sm font-black text-emerald-600">
                     S/ {costoTotalMateriales.toFixed(2)}
                   </span>
                 </div>
               </div>
             </div>
           )}

        {/* Botón de Guardado */}
        {canEdit && (
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button
                type="submit"
                disabled={isLoading || isSaving}
                className="bg-gray-900 hover:bg-black text-white h-10 px-6 font-bold gap-2 rounded-lg transition-all"
              >
                {(isLoading || isSaving) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><Save size={15} /> {ficha?.id ? "Sincronizar Ficha Técnica" : "Crear Ficha"}</>
                )}
              </Button>
            </div>
          )}
      </form>
    </div>
  );
}
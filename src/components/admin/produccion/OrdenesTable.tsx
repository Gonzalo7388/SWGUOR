"use client";

import { Eye, Factory, User, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ETAPA_LABELS } from "@/lib/schemas/ordenes-produccion";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface OrdenesTableProps {
  data: any[];
  onView: (orden: any) => void;
  onEdit: (orden: any) => void;
}

export default function OrdenesTable({ data, onView, onEdit }: OrdenesTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest">ID</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Producto / Ficha</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Taller Asignado</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-center">Cant.</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Estado</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                  No se encontraron órdenes con los filtros aplicados.
                </td>
              </tr>
            ) : (
              data.map((orden) => (
                <tr 
                  key={orden.id} 
                  onClick={() => onView(orden)}
                  className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-mono text-[11px] font-bold text-slate-400">
                    #{orden.id}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                      {orden.productos?.nombre}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Factory size={10} /> 
                      Ficha Técnica v{orden.fichas_tecnicas?.version || '1.0'}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <User size={14} />
                      </div>
                      <span className="font-medium text-slate-600">{orden.talleres?.nombre}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="inline-block bg-slate-100 px-2 py-1 rounded-md font-black text-slate-700 min-w-[30px]">
                      {orden.cantidad_solicitada}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getEtapaColor(orden.seguimiento_produccion?.[0]?.etapa)}`}>
                      {ETAPA_LABELS[orden.seguimiento_produccion?.[0]?.etapa as keyof typeof ETAPA_LABELS] || 'Pendiente'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onView(orden)}
                        className="h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye size={16} className="text-slate-400" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                            <MoreVertical size={16} className="text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-200">
                          <DropdownMenuItem 
                            onClick={() => onEdit(orden)}
                            className="text-xs font-medium cursor-pointer"
                          >
                            Editar Orden
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onView(orden)}
                            className="text-xs font-medium cursor-pointer"
                          >
                            Ver Detalles
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getEtapaColor(etapa: string) {
  const colors: any = {
    corte: "bg-blue-50 text-blue-600 border-blue-100",
    costura: "bg-orange-50 text-orange-600 border-orange-100",
    entrega: "bg-emerald-50 text-emerald-600 border-emerald-100",
    almacen: "bg-purple-50 text-purple-600 border-purple-100",
  };
  return colors[etapa] || "bg-slate-50 text-slate-400 border-slate-100";
}
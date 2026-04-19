"use client";

import { useRouter } from "next/navigation";
import { Edit2, Trash2, Mail, Phone, User, ShieldCheck, ShieldAlert, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton"; // Asegúrate de tener este componente de shadcn

interface ClientesTableProps {
  data: any[];
  isLoading?: boolean; // Nueva prop para controlar el estado de carga
  onEdit?: (c: any) => void;
  onDelete?: (c: any) => void;
  onToggleStatus?: (c: any) => void;
}

export default function ClientesTable({ 
  data, 
  isLoading,
  onEdit, 
  onDelete, 
  onToggleStatus 
}: ClientesTableProps) {
  const router = useRouter();
  const showActions = !!onEdit || !!onDelete || !!onToggleStatus;

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'activo': return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case 'inactivo': return "bg-orange-50 text-orange-600 border-orange-100";
      case 'suspendido': return "bg-red-50 text-red-600 border-red-100";
      case 'potencial': return "bg-blue-50 text-blue-600 border-blue-100";
      default: return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-4">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left">
              <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase">Cliente / Empresa</th>
              <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase">Contacto</th>
              <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase">Documento</th>
              <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase text-center">Estado</th>
              {showActions && (
                <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase text-right">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Mostramos 5 filas de Skeleton mientras carga
              Array.from({ length: 5 }).map((_, i) => (
                <ClientesSkeleton key={i} showActions={showActions} />
              ))
            ) : data.length > 0 ? (
              data.map((c) => (
                <tr 
                  key={c.id} 
                  className="group transition-all duration-200 cursor-pointer"
                  onClick={() => router.push(`/admin/Panel-Administrativo/clientes/${c.id}`)}
                >
                  <td className="bg-white border-y border-l border-slate-100 py-5 px-6 rounded-l-2xl shadow-sm group-hover:shadow-md group-hover:bg-slate-50/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 
                        ${c.activo === 'activo' ? 'bg-pink-50 text-pink-600 border-pink-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        <User className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-slate-900 text-sm tracking-tight uppercase leading-none truncate max-w-50">
                          {c.nombre_comercial || c.razon_social}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-medium truncate max-w-45">
                          {c.direccion_fiscal || 'Sin dirección'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="bg-white border-y border-slate-100 py-5 px-6 shadow-sm group-hover:shadow-md group-hover:bg-slate-50/50 transition-all">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-[13px] font-bold text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-300"/> {c.email || '---'}
                      </span>
                      <span className="flex items-center gap-2 text-[12px] font-medium text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-slate-300"/> {c.telefono || '---'}
                      </span>
                    </div>
                  </td>

                  <td className="bg-white border-y border-slate-100 py-5 px-6 shadow-sm group-hover:shadow-md group-hover:bg-slate-50/50 transition-all">
                    <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Hash size={14} className="text-slate-400" />
                      <span className="font-mono text-[13px] font-bold text-slate-700">{c.ruc || "---"}</span>
                    </div>
                  </td>

                  <td className={`bg-white border-y border-slate-100 text-center shadow-sm group-hover:shadow-md group-hover:bg-slate-50/50 transition-all ${!showActions ? 'rounded-r-2xl border-r' : ''}`}>
                    <Badge className={`rounded-full px-4 py-1 text-[10px] font-black border-2 uppercase transition-colors ${getStatusStyles(c.activo)}`} variant="outline">
                      {c.activo || "S/E"}
                    </Badge>
                  </td>

                  {showActions && (
                    <td className="bg-white border-y border-r border-slate-100 px-6 rounded-r-2xl text-right shadow-sm group-hover:shadow-md group-hover:bg-slate-50/50 transition-all" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end items-center gap-2">
                        {onToggleStatus && <div className="w-9 h-9 bg-slate-100 rounded-xl animate-pulse" />} {/* Placeholder simple o los botones reales deshabilitados */}
                        {onEdit && <div className="w-9 h-9 bg-slate-100 rounded-xl animate-pulse" />}
                        {onDelete && <div className="w-9 h-9 bg-slate-100 rounded-xl animate-pulse" />}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  No se encontraron registros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Componente Interno de Skeleton para mantener el diseño idéntico
function ClientesSkeleton({ showActions }: { showActions: boolean }) {
  return (
    <tr>
      <td className="bg-white border-y border-l border-slate-50 py-5 px-6 rounded-l-2xl">
        <div className="flex items-center gap-4">
          <Skeleton className="h-11 w-11 rounded-xl bg-slate-100" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-slate-100" />
            <Skeleton className="h-3 w-24 bg-slate-100" />
          </div>
        </div>
      </td>
      <td className="bg-white border-y border-slate-50 py-5 px-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28 bg-slate-100" />
          <Skeleton className="h-3 w-20 bg-slate-100" />
        </div>
      </td>
      <td className="bg-white border-y border-slate-50 py-5 px-6">
        <Skeleton className="h-8 w-24 rounded-lg bg-slate-100" />
      </td>
      <td className="bg-white border-y border-slate-50 py-5 px-6 text-center">
        <Skeleton className="h-6 w-20 rounded-full mx-auto bg-slate-100" />
      </td>
      {showActions && (
        <td className="bg-white border-y border-r border-slate-50 px-6 rounded-r-2xl">
          <div className="flex justify-end gap-2">
            <Skeleton className="h-9 w-9 rounded-xl bg-slate-100" />
            <Skeleton className="h-9 w-9 rounded-xl bg-slate-100" />
          </div>
        </td>
      )}
    </tr>
  );
}
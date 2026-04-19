"use client";

import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Eye } from "lucide-react"; // Añadido Eye
import { ESTADO_CONFECCION, ESTADO_LABELS, PRIORIDAD_LABELS } from "@/lib/schemas/confecciones";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ── Tipos ────────────────────────────────────────────────────────────────────

export type ConfeccionRow = {
  id:             number;
  pedido_id:      number;
  pedido?:        { id: number; numero_orden: string } | null;
  taller?:        { id: number; nombre: string } | null;
  prenda:         string;
  cantidad:       number;
  costo_unitario: number | null;
  fecha_entrega:  string | null;
  prioridad:      "baja" | "media" | "alta" | "urgente";
  estado:         typeof ESTADO_CONFECCION[number];
  created_at:     string;
};

interface ConfeccionesTableProps {
  data:            ConfeccionRow[];
  isLoading:       boolean;
  onEstadoChange:  (id: number, estado: ConfeccionRow["estado"]) => void;
}

// ── Configuración visual de badges ───────────────────────────────────────────

const ESTADO_VARIANT: Record<ConfeccionRow["estado"], string> = {
  pendiente:  "bg-slate-100  text-slate-700  border-slate-200",
  en_corte:   "bg-blue-100   text-blue-700   border-blue-200",
  en_costura: "bg-violet-100 text-violet-700 border-violet-200",
  acabados:   "bg-amber-100  text-amber-700  border-amber-200",
  completado: "bg-green-100  text-green-700  border-green-200",
  cancelado:  "bg-red-100    text-red-700    border-red-200",
};

const PRIORIDAD_VARIANT: Record<ConfeccionRow["prioridad"], string> = {
  baja:    "bg-gray-100   text-gray-500",
  media:   "bg-sky-100    text-sky-600",
  alta:    "bg-orange-100 text-orange-600",
  urgente: "bg-red-100    text-red-600 font-bold",
};

const SIGUIENTE_ESTADO: Partial<Record<ConfeccionRow["estado"], ConfeccionRow["estado"][]>> = {
  pendiente:  ["en_corte",   "cancelado"],
  en_corte:   ["en_costura", "cancelado"],
  en_costura: ["acabados",   "cancelado"],
  acabados:   ["completado", "cancelado"],
};

// ── Componente Principal ──────────────────────────────────────────────────────

export function ConfeccionesTable({ data, isLoading, onEstadoChange }: ConfeccionesTableProps) {
  const router = useRouter();
  
  return (
    <div className="rounded-xl border overflow-hidden bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="w-[80px] text-[10px] font-black uppercase tracking-widest text-slate-400">ID</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prenda</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Taller</TableHead>
            <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Cant.</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prioridad</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entrega</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Costo Unit.</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Renderiza 5 filas de Skeleton
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-40 text-center text-muted-foreground">
                <p className="font-semibold text-sm">No hay órdenes de confección</p>
                <p className="text-xs">Crea la primera orden con el botón "Nueva Orden".</p>
              </TableCell>
            </TableRow>
          ) : (
            data.map((orden) => {
              const siguientes = SIGUIENTE_ESTADO[orden.estado] ?? [];
              return (
                <TableRow 
                  key={orden.id} 
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/admin/Panel-Administrativo/confecciones/${orden.id}`)}
                >
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    #{orden.id}
                  </TableCell>

                  <TableCell>
                    <p className="font-bold text-slate-700 text-sm group-hover:text-pink-600 transition-colors">
                      {orden.prenda}
                    </p>
                    {orden.pedido && (
                      <p className="text-[10px] font-medium text-slate-400">
                        Pedido {orden.pedido.numero_orden}
                      </p>
                    )}
                  </TableCell>

                  <TableCell className="text-sm font-medium text-slate-600">
                    {orden.taller?.nombre ?? "—"}
                  </TableCell>

                  <TableCell className="text-center font-bold text-slate-700">
                    {orden.cantidad.toLocaleString("es-PE")}
                  </TableCell>

                  <TableCell>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider
                      ${PRIORIDAD_VARIANT[orden.prioridad]}`}>
                      {PRIORIDAD_LABELS[orden.prioridad]}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-black uppercase border-2 ${ESTADO_VARIANT[orden.estado]}`}
                    >
                      {ESTADO_LABELS[orden.estado]}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs font-medium text-slate-500">
                    {orden.fecha_entrega
                      ? format(new Date(orden.fecha_entrega), "d MMM yyyy", { locale: es })
                      : "—"}
                  </TableCell>

                  <TableCell className="text-right font-mono text-sm font-bold text-slate-700">
                    {orden.costo_unitario != null
                      ? `S/ ${orden.costo_unitario.toFixed(2)}`
                      : "—"}
                  </TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400">Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/admin/Panel-Administrativo/confecciones/${orden.id}`)}>
                          <Eye className="mr-2 h-4 w-4" /> Ver detalle
                        </DropdownMenuItem>
                        
                        {siguientes.length > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400">Avanzar estado</DropdownMenuLabel>
                            {siguientes.map((sig) => (
                              <DropdownMenuItem
                                key={sig}
                                onClick={() => onEstadoChange(orden.id, sig)}
                                className={sig === "cancelado" ? "text-red-600 focus:text-red-600" : "font-medium"}
                              >
                                → {ESTADO_LABELS[sig]}
                              </DropdownMenuItem>
                            ))}
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-slate-400 text-[10px] font-mono" disabled>
                          ID: #{orden.id}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
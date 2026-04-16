"use client";

import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge }  from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton }        from "@/components/ui/skeleton";
import { MoreHorizontal }  from "lucide-react";
import { ESTADO_CONFECCION, ESTADO_LABELS, PRIORIDAD_LABELS } from "@/lib/schemas/confecciones";
import { format }          from "date-fns";
import { es }              from "date-fns/locale";

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

// ── Estados hacia los que se puede avanzar ────────────────────────────────────

const SIGUIENTE_ESTADO: Partial<Record<ConfeccionRow["estado"], ConfeccionRow["estado"][]>> = {
  pendiente:  ["en_corte",   "cancelado"],
  en_corte:   ["en_costura", "cancelado"],
  en_costura: ["acabados",   "cancelado"],
  acabados:   ["completado", "cancelado"],
};

// ── Componente ────────────────────────────────────────────────────────────────

export function ConfeccionesTable({ data, isLoading, onEstadoChange }: ConfeccionesTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="font-semibold">No hay órdenes de confección</p>
        <p className="text-sm">Crea la primera orden con el botón "Nueva Orden".</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[60px]">#</TableHead>
            <TableHead>Prenda</TableHead>
            <TableHead>Taller</TableHead>
            <TableHead className="text-center">Cantidad</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Entrega</TableHead>
            <TableHead className="text-right">Costo Unit.</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((orden) => {
            const siguientes = SIGUIENTE_ESTADO[orden.estado] ?? [];
            return (
              <TableRow key={orden.id} className="hover:bg-muted/30 transition-colors">
                {/* ID */}
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{orden.id}
                </TableCell>

                {/* Prenda */}
                <TableCell>
                  <p className="font-semibold text-sm">{orden.prenda}</p>
                  {orden.pedido && (
                    <p className="text-xs text-muted-foreground">
                      Pedido {orden.pedido.numero_orden}
                    </p>
                  )}
                </TableCell>

                {/* Taller */}
                <TableCell className="text-sm">
                  {orden.taller?.nombre ?? "—"}
                </TableCell>

                {/* Cantidad */}
                <TableCell className="text-center font-medium">
                  {orden.cantidad.toLocaleString("es-PE")}
                </TableCell>

                {/* Prioridad */}
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${PRIORIDAD_VARIANT[orden.prioridad]}`}>
                    {PRIORIDAD_LABELS[orden.prioridad]}
                  </span>
                </TableCell>

                {/* Estado */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-xs ${ESTADO_VARIANT[orden.estado]}`}
                  >
                    {ESTADO_LABELS[orden.estado]}
                  </Badge>
                </TableCell>

                {/* Fecha entrega */}
                <TableCell className="text-sm text-muted-foreground">
                  {orden.fecha_entrega
                    ? format(new Date(orden.fecha_entrega), "d MMM yyyy", { locale: es })
                    : "—"}
                </TableCell>

                {/* Costo */}
                <TableCell className="text-right font-mono text-sm">
                  {orden.costo_unitario != null
                    ? `S/ ${orden.costo_unitario.toFixed(2)}`
                    : "—"}
                </TableCell>

                {/* Acciones */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Avanzar estado</DropdownMenuLabel>
                      {siguientes.length > 0 ? (
                        siguientes.map((sig) => (
                          <DropdownMenuItem
                            key={sig}
                            onClick={() => onEstadoChange(orden.id, sig)}
                            className={sig === "cancelado" ? "text-destructive" : ""}
                          >
                            → {ESTADO_LABELS[sig]}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem disabled>Sin acciones disponibles</DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-muted-foreground text-xs" disabled>
                        Orden #{orden.id}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
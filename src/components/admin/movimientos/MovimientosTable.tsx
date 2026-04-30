"use client";

import React, { useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUp,
  ArrowDown,
  RotateCcw,
  AlertCircle,
  PackageOpen,
  Boxes,
  Factory,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Movimiento {
  id: string;
  producto_id?: string | null;
  insumo_id?: string | null;
  material_id?: string | null;
  cantidad: number;
  motivo?: string | null;
  usuario_id?: string | null;
  tipo_movimiento: "entrada" | "salida" | "ajuste";
  referencia_tipo?: "ORDEN" | "COMPRA" | "VENTA" | "AJUSTE" | null;
  referencia_id?: string | null;
  costo_unitario?: number | null;
  stock_anterior?: number | null;
  stock_posterior?: number | null;
  created_at: string;
  updated_at?: string;
  producto?: {
    id: string;
    nombre: string;
  };
  insumo?: {
    id: string;
    nombre: string;
    unidad_medida: string;
  };
  material?: {
    id: string;
    nombre: string;
  };
  usuario?: {
    id: string;
    nombre: string;
  };
}

interface MovimientosTableProps {
  movimientos: Movimiento[];
  isLoading?: boolean;
}

const TIPO_MOVIMIENTO_CONFIG = {
  entrada: {
    label: "Entrada",
    color: "bg-green-100 text-green-800",
    icon: ArrowUp,
  },
  salida: {
    label: "Salida",
    color: "bg-red-100 text-red-800",
    icon: ArrowDown,
  },
  ajuste: {
    label: "Ajuste",
    color: "bg-blue-100 text-blue-800",
    icon: RotateCcw,
  },
};

const REFERENCIA_CONFIG = {
  ORDEN: { label: "Orden de Compra", color: "bg-purple-100 text-purple-800" },
  COMPRA: { label: "Compra", color: "bg-indigo-100 text-indigo-800" },
  VENTA: { label: "Venta", color: "bg-orange-100 text-orange-800" },
  AJUSTE: { label: "Ajuste", color: "bg-gray-100 text-gray-800" },
};

export function MovimientosTable({
  movimientos,
  isLoading,
}: MovimientosTableProps) {
  const getTipoItem = (mov: Movimiento) => {
    if (mov.producto_id) return { tipo: "producto", icon: PackageOpen };
    if (mov.insumo_id) return { tipo: "insumo", icon: Boxes };
    if (mov.material_id) return { tipo: "material", icon: Factory };
    return { tipo: "unknown", icon: AlertCircle };
  };

  const getItemName = (mov: Movimiento) => {
    if (mov.producto) return mov.producto.nombre;
    if (mov.insumo) return mov.insumo.nombre;
    if (mov.material) return mov.material.nombre;
    return "Desconocido";
  };

  const getUnidad = (mov: Movimiento) => {
    if (mov.insumo) return mov.insumo.unidad_medida;
    return "unidades";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Movimientos de Inventario</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Artículo</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Stock Anterior</TableHead>
                <TableHead>Stock Posterior</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Usuario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Cargando movimientos...
                  </TableCell>
                </TableRow>
              ) : movimientos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No hay movimientos registrados
                  </TableCell>
                </TableRow>
              ) : (
                movimientos.map((mov) => {
                  const tipoItem = getTipoItem(mov);
                  const Icon = TIPO_MOVIMIENTO_CONFIG[mov.tipo_movimiento].icon;
                  const ItemIcon = tipoItem.icon;

                  return (
                    <TableRow key={mov.id}>
                      <TableCell className="text-sm">
                        {format(new Date(mov.created_at), "dd/MM/yyyy HH:mm", {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <Badge
                            className={
                              TIPO_MOVIMIENTO_CONFIG[mov.tipo_movimiento].color
                            }
                          >
                            {TIPO_MOVIMIENTO_CONFIG[mov.tipo_movimiento].label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="flex items-center gap-2">
                              <ItemIcon className="w-4 h-4" />
                              <span className="text-sm truncate max-w-[200px]">
                                {getItemName(mov)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{getItemName(mov)}</p>
                              <p className="text-xs text-gray-400">
                                {tipoItem.tipo.substring(0, 1).toUpperCase() +
                                  tipoItem.tipo.substring(1)}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold">{mov.cantidad}</span>
                        <span className="text-gray-500 ml-2 text-sm">
                          {getUnidad(mov)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {mov.stock_anterior != null ? mov.stock_anterior.toFixed(2) : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {mov.stock_posterior != null ? mov.stock_posterior.toFixed(2) : "-"}
                      </TableCell>
                      <TableCell>
                        {mov.referencia_tipo && (
                          <Badge
                            className={
                              REFERENCIA_CONFIG[
                                mov.referencia_tipo as keyof typeof REFERENCIA_CONFIG
                              ]?.color || "bg-gray-100"
                            }
                          >
                            {
                              REFERENCIA_CONFIG[
                                mov.referencia_tipo as keyof typeof REFERENCIA_CONFIG
                              ]?.label || mov.referencia_tipo
                            }
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">
                        {mov.motivo || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {mov.usuario?.nombre || "Sistema"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

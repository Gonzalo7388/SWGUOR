"use client";

import { useState, useEffect } from "react";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useMovimientos, useResumenMovimientos } from "@/lib/hooks/useMovimientos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Search,
  RefreshCw,
  Calendar,
  Download,
} from "lucide-react";
import type { TipoMovimiento, ReferenciaMovimiento } from "@prisma/client";

export default function MovimientosInventarioPage() {
  const { can, isLoading: authLoading } = usePermissions();
  const [filtroTipo, setFiltroTipo] = useState<TipoMovimiento | "">("");
  const [filtroReferencia, setFiltroReferencia] = useState<ReferenciaMovimiento | "">("");
  const [busqueda, setBusqueda] = useState("");
  const [desdeStr, setDesdeStr] = useState("");
  const [hastaStr, setHastaStr] = useState("");

  // Preparar filtros para el hook
  const desdeDate = desdeStr ? new Date(desdeStr) : undefined;
  const hastaDate = hastaStr ? new Date(hastaStr) : undefined;

  const { movimientos, isLoading } = useMovimientos({
    tipo_movimiento: (filtroTipo || undefined) as TipoMovimiento | undefined,
    referencia_tipo: (filtroReferencia || undefined) as ReferenciaMovimiento | undefined,
    busqueda: busqueda || undefined,
    desde: desdeDate,
    hasta: hastaDate,
    autoRefresh: true,
  });

  const { resumen } = useResumenMovimientos({
    desde: desdeDate,
    hasta: hastaDate,
  });

  if (authLoading) {
    return <div className="p-6">Cargando permisos...</div>;
  }

  if (!can("view", "inventario")) {
    return (
      <div className="p-6 text-red-600">
        No tienes permisos para ver el inventario
      </div>
    );
  }

  const tipoIconos: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    entrada: {
      icon: <ArrowUp className="w-4 h-4" />,
      color: "bg-emerald-50 text-emerald-700",
      label: "Entrada",
    },
    salida: {
      icon: <ArrowDown className="w-4 h-4" />,
      color: "bg-red-50 text-red-700",
      label: "Salida",
    },
    ajuste: {
      icon: <RotateCcw className="w-4 h-4" />,
      color: "bg-amber-50 text-amber-700",
      label: "Ajuste",
    },
  };

  const formatFecha = (fecha: string | Date) => {
    const date = typeof fecha === "string" ? new Date(fecha) : fecha;
    return date.toLocaleString("es-PE", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Historial de Movimientos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registro automático de todos los movimientos de inventario
          </p>
        </div>
      </div>

      {/* Resumen cards */}
      {resumen && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Total
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {resumen.total}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-emerald-200 p-4">
            <div className="flex items-center gap-2">
              <ArrowUp className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Entradas
              </p>
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-2">
              {resumen.entradas}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-red-200 p-4">
            <div className="flex items-center gap-2">
              <ArrowDown className="w-4 h-4 text-red-600" />
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider">
                Salidas
              </p>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {resumen.salidas}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-amber-200 p-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Ajustes
              </p>
            </div>
            <p className="text-2xl font-bold text-amber-600 mt-2">
              {resumen.ajustes}
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="space-y-4 bg-white rounded-lg border border-slate-200 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Búsqueda */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Búsqueda
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Motivo, referencia..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9 border-slate-200"
              />
            </div>
          </div>

          {/* Tipo movimiento */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Tipo
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Todos</option>
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="ajuste">Ajuste</option>
            </select>
          </div>

          {/* Referencia */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Referencia
            </label>
            <select
              value={filtroReferencia}
              onChange={(e) => setFiltroReferencia(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Todas</option>
              <option value="ORDEN">Orden</option>
              <option value="COMPRA">Compra</option>
              <option value="VENTA">Venta</option>
              <option value="AJUSTE">Ajuste</option>
            </select>
          </div>

          {/* Desde */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Desde
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="date"
                value={desdeStr}
                onChange={(e) => setDesdeStr(e.target.value)}
                className="pl-9 border-slate-200"
              />
            </div>
          </div>

          {/* Hasta */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Hasta
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="date"
                value={hastaStr}
                onChange={(e) => setHastaStr(e.target.value)}
                className="pl-9 border-slate-200"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => {
              setFiltroTipo("");
              setFiltroReferencia("");
              setBusqueda("");
              setDesdeStr("");
              setHastaStr("");
            }}
            variant="outline"
            className="border-slate-200"
          >
            Limpiar filtros
          </Button>
        </div>
      </div>

      {/* Lista de movimientos */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                Cargando movimientos…
              </p>
            </div>
          </div>
        ) : movimientos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Sin movimientos
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {movimientos.map((mov: any) => {
              const tipoInfo =
                tipoIconos[mov.tipo_movimiento] || tipoIconos.ajuste;
              return (
                <div
                  key={mov.id}
                  className="bg-white rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Tipo e info principal */}
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`p-2 rounded-lg ${tipoInfo.color}`}
                      >
                        {tipoInfo.icon}
                      </div>

                      <div className="flex-1">
                        <p className="font-bold text-slate-900">
                          {mov.productos?.nombre ||
                            mov.materiales?.nombre ||
                            mov.insumo?.nombre}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {mov.motivo}
                        </p>
                      </div>
                    </div>

                    {/* Cantidad y badges */}
                    <div className="flex items-center gap-2 sm:justify-end">
                      <Badge
                        variant="outline"
                        className={tipoInfo.color}
                      >
                        {mov.cantidad} unidades
                      </Badge>
                      {mov.referencia_tipo && (
                        <Badge variant="secondary">
                          {mov.referencia_tipo}
                        </Badge>
                      )}
                    </div>

                    {/* Fecha y usuario */}
                    <div className="text-right sm:text-left">
                      <p className="text-xs text-slate-500">
                        {formatFecha(mov.created_at)}
                      </p>
                      {mov.usuarios && (
                        <p className="text-xs text-slate-400 mt-1">
                          Por: {mov.usuarios.nombre}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

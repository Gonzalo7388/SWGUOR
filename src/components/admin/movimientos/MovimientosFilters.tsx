"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw } from "lucide-react";

export interface MovimientosFiltersState {
  tipoMovimiento?: "entrada" | "salida" | "ajuste" | "";
  referenciaMovimiento?: "ORDEN" | "COMPRA" | "VENTA" | "AJUSTE" | "";
  tipoItem?: "producto" | "insumo" | "material" | "";
  busqueda?: string;
  desde?: string;
  hasta?: string;
}

interface MovimientosFiltersProps {
  onFilterChange: (filters: MovimientosFiltersState) => void;
}

export function MovimientosFilters({
  onFilterChange,
}: MovimientosFiltersProps) {
  const [filters, setFilters] = useState<MovimientosFiltersState>({});

  const handleFilterChange = (newFilters: MovimientosFiltersState) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleReset = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filtros de Búsqueda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda por nombre */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Buscar artículo</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Producto, insumo o material..."
                className="pl-8"
                value={filters.busqueda || ""}
                onChange={(e) =>
                  handleFilterChange({ busqueda: e.target.value })
                }
              />
            </div>
          </div>

          {/* Tipo de Movimiento */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tipo de Movimiento</label>
            <Select
              value={filters.tipoMovimiento || ""}
              onValueChange={(value) =>
                handleFilterChange({
                  tipoMovimiento: value
                    ? (value as "entrada" | "salida" | "ajuste")
                    : "",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="salida">Salida</SelectItem>
                <SelectItem value="ajuste">Ajuste</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Referencia de Movimiento */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Referencia</label>
            <Select
              value={filters.referenciaMovimiento || ""}
              onValueChange={(value) =>
                handleFilterChange({
                  referenciaMovimiento: value
                    ? (value as "ORDEN" | "COMPRA" | "VENTA" | "AJUSTE")
                    : "",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="ORDEN">Orden de Compra</SelectItem>
                <SelectItem value="COMPRA">Compra</SelectItem>
                <SelectItem value="VENTA">Venta</SelectItem>
                <SelectItem value="AJUSTE">Ajuste</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Artículo */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tipo de Artículo</label>
            <Select
              value={filters.tipoItem || ""}
              onValueChange={(value) =>
                handleFilterChange({
                  tipoItem: value
                    ? (value as "producto" | "insumo" | "material")
                    : "",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="producto">Productos</SelectItem>
                <SelectItem value="insumo">Insumos</SelectItem>
                <SelectItem value="material">Materiales</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fecha desde */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Desde</label>
            <Input
              type="date"
              value={filters.desde || ""}
              onChange={(e) =>
                handleFilterChange({ desde: e.target.value })
              }
            />
          </div>

          {/* Fecha hasta */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Hasta</label>
            <Input
              type="date"
              value={filters.hasta || ""}
              onChange={(e) =>
                handleFilterChange({ hasta: e.target.value })
              }
            />
          </div>

          {/* Botón reset */}
          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

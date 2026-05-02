"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, RotateCcw, TrendingUp } from "lucide-react";

export interface EstadisticasMovimientos {
  totalEntradas: number;
  totalSalidas: number;
  totalAjustes: number;
  totalMovimientos: number;
  montoTotalEntradas?: number;
  montoTotalSalidas?: number;
}

interface EstadisticasMovimientosProps {
  estadisticas: EstadisticasMovimientos;
  isLoading?: boolean;
}

export function EstadisticasMovimientos({
  estadisticas,
  isLoading,
}: EstadisticasMovimientosProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-8 bg-gray-200 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Entradas",
      value: estadisticas.totalEntradas,
      icon: ArrowUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      monto: estadisticas.montoTotalEntradas,
    },
    {
      label: "Salidas",
      value: estadisticas.totalSalidas,
      icon: ArrowDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      monto: estadisticas.montoTotalSalidas,
    },
    {
      label: "Ajustes",
      value: estadisticas.totalAjustes,
      icon: RotateCcw,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      label: "Total Movimientos",
      value: estadisticas.totalMovimientos,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className={`border-2 ${stat.borderColor} ${stat.bgColor}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              {stat.monto !== undefined && (
                <p className="text-xs text-gray-600 mt-2">
                  Monto: ${stat.monto.toFixed(2)}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

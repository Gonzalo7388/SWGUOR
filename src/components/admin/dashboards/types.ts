import type { insumo, pedidos } from "@prisma/client";

export interface OrdenConCliente extends pedidos {
  clientes: {
    razon_social: string;
    tipo_cliente?: string; // Campo existente en el modelo clientes [cite: 218]
  } | null;
}

export interface ApiData {
  kpis: {
    total_ventas: number;
    total_clientes: number;
    stock_alerta: number;
    nuevas_ordenes: number;
  };
  chartIngresos: { created_at: string; total: number }[];
  chartProductos: { cantidad: number; productos: { nombre: string } | null }[];
  recentOrders: OrdenConCliente[];
  criticalStock: insumo[];
}
import type { insumo, ordenes_compra } from "@prisma/client";

export interface OrdenConCliente extends ordenes_compra {
  clientes: {
    razon_social: string;
    ruc?: string;
    email?: string;
    telefono?: string | number | null;
    direccion?: string;
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
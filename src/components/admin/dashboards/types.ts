import type { insumo, ordenes } from "@prisma/client";

interface OrdenConCliente extends ordenes {
  cliente: {
    razon_social: string;
    ruc: string;
    email: string;
    telefono: string | number | null;
    direccion: string;
  } | null;
}

export interface DashboardStats {
  totalVentas:   number;
  totalClientes: number;
  stockBajo:     number;
  pedidosNuevos: number;
}

export interface ApiData {
  kpis: {
    total_ventas: number;
    total_clientes: number;
    stock_alerta: number;
    nuevas_ordenes: number;
  } & Record<string, any>;
  chartIngresos: { created_at: string; total: number }[];
  chartProductos: { cantidad: number; productos: { nombre: string } | null }[];
  recentOrders: OrdenConCliente[];
  criticalStock: insumo[];
}
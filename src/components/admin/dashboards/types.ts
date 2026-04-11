import type { Database } from '@/types/database';

export type Insumo = Database['public']['Tables']['insumo']['Row'];
export type EstadoOrden = Database['public']['Enums']['EstadoOrden'];
export type Orden = Database['public']['Tables']['ordenes']['Row'];
export type OrdenConCliente = Orden & { clientes: { razon_social: string } | null };

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
  criticalStock: Insumo[];
}
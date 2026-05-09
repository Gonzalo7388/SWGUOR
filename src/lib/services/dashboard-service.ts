import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';

export interface VentaResumen {
  id: string;
  cliente: string;
  monto: number;
  fecha: string;
  estado: string;
}

export interface VentaMensual {
  mes: string;
  total: number;
}

export interface DashboardKpis {
  total_ventas: number;
  total_pedidos: number;
  total_clientes: number;
  ticket_promedio: number;
  crecimiento_ventas: number;
  stock_alerta: number;
  total_insumos?: number;
  // Compatibilidad
  nuevas_ordenes?: number;
  facturacion?: number;
  clientesB2B?: number;
  pedidosActivos?: number;
  cotizacionesPend?: number;
}

export const DashboardService = {
  async getDashboardData(role: string, days: number = 30) {
    const data: any = {
      kpis: await this.getKpis(days),
      recentSales: await this.getRecentSales(5),
      monthlySales: await this.getMonthlySales(),
      criticalStock: await this.getCriticalStock(10),
    };

    // Agregar datos específicos por rol
    if (role === 'almacenero') {
      data.almacen = await this.getAlmaceneroMetrics();
    } else if (role === 'disenador' || role === 'disenador') {
      data.diseno = await this.getDisenadorMetrics();
    } else if (role === 'cortador') {
      data.corte = await this.getCortadorMetrics();
    } else if (role === 'recepcionista') {
      data.recepcion = await this.getRecepcionistaMetrics();
    }

    return serializeBigInt(data);
  },

  async getKpis(days: number): Promise<DashboardKpis> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalVentas, totalPedidos, totalClientes, stockAlerta, totalInsumos] = await Promise.all([
      prisma.pedidos.aggregate({
        _sum: { total: true },
        where: { created_at: { gte: startDate }, estado: { not: 'cancelado' } }
      }),
      prisma.pedidos.count({ where: { created_at: { gte: startDate } } }),
      prisma.clientes.count({ where: { activo: 'activo' } }),
      prisma.insumo.count({
        where: {
          stock_actual: { lte: prisma.insumo.fields.stock_minimo }
        }
      }),
      prisma.insumo.count(),
    ]);

    const totalVentasValue = Number(totalVentas._sum?.total || 0);

    return {
      total_ventas: totalVentasValue,
      total_pedidos: totalPedidos,
      total_clientes: totalClientes,
      ticket_promedio: totalPedidos > 0 ? totalVentasValue / totalPedidos : 0,
      crecimiento_ventas: 12.5,
      stock_alerta: stockAlerta,
      total_insumos: totalInsumos,
      // Compatibilidad
      nuevas_ordenes: totalPedidos,
      facturacion: totalVentasValue,
      clientesB2B: totalClientes,
      pedidosActivos: totalPedidos,
      cotizacionesPend: 0 // Se podría calcular si fuera necesario
    };
  },

  async getAlmaceneroMetrics() {
    const [movimientos, ordenesCompra] = await Promise.all([
      prisma.movimientos_inventario.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: { insumo: true, materiales: true, usuarios: true }
      }),
      prisma.ordenes_compra.findMany({
        where: { estado: 'pendiente' },
        take: 5,
        include: { proveedores: true }
      })
    ]);

    return {
      movimientos: movimientos.map(m => ({
        id: m.id.toString(),
        item: m.insumo?.nombre || m.materiales?.nombre || 'Item desconocido',
        qty: `${(m.cantidad || 0) > 0 ? '+' : ''}${m.cantidad}`,
        date: m.created_at.toISOString(),
        user: m.usuarios?.email || 'Sistema',
        type: (m.cantidad || 0) > 0 ? 'entrada' : 'salida'
      })),
      ordenes_pendientes: ordenesCompra.length
    };
  },

  async getDisenadorMetrics() {
    const [diseños, fichas] = await Promise.all([
      prisma.productos.count({ where: { estado: 'activo' } }),
      prisma.fichas_tecnicas.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: { productos: true }
      })
    ]);

    return {
      fichas_recientes: fichas.map(f => ({
        id: f.id.toString(),
        prenda: f.productos?.nombre || 'Sin producto',
        version: f.version,
        estado: f.estado,
        fecha: f.created_at.toISOString()
      })),
      total_diseños: diseños
    };
  },

  async getCortadorMetrics() {
    const ordenes = await prisma.ordenes_produccion.findMany({
      where: { estado: 'confirmada' },
      take: 10,
      include: { productos: true }
    });

    return {
      cola_trabajo: ordenes.map(o => ({
        id: o.id.toString(),
        prenda: o.productos?.nombre || 'Desconocido',
        lotes: o.cantidad_solicitada,
        estado: o.estado,
        prioridad: 'normal'
      }))
    };
  },

  async getRecepcionistaMetrics() {
    const [cotizaciones, pedidosHoy] = await Promise.all([
      prisma.cotizaciones.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: { clientes: true }
      }),
      prisma.pedidos.count({
        where: {
          created_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    return {
      cotizaciones_recientes: cotizaciones.map(c => ({
        id: c.id.toString(),
        cliente: c.clientes?.razon_social || 'Cliente Varios',
        total: Number(c.total || 0),
        estado: c.estado
      })),
      pedidos_hoy: pedidosHoy
    };
  },

  async getRecentSales(limit: number): Promise<VentaResumen[]> {
    const sales = await prisma.pedidos.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
      include: { clientes: true }
    });

    return sales.map(s => ({
      id: s.id.toString(),
      cliente: s.clientes?.razon_social || 'Cliente Varios',
      monto: Number(s.total || 0),
      fecha: s.created_at?.toISOString() || new Date().toISOString(),
      estado: s.estado || 'pendiente'
    }));
  },

  async getMonthlySales(): Promise<VentaMensual[]> {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    return months.map(m => ({
      mes: m,
      total: Math.floor(Math.random() * 50000) + 20000
    }));
  },

  async getCriticalStock(limit: number) {
    const items = await prisma.insumo.findMany({
      where: {
        stock_actual: { lte: prisma.insumo.fields.stock_minimo }
      },
      take: limit,
      orderBy: { stock_actual: 'asc' }
    });

    return items.map(i => ({
      id: i.id.toString(),
      nombre: i.nombre,
      stock: Number(i.stock_actual),
      minimo: Number(i.stock_minimo)
    }));
  }
};

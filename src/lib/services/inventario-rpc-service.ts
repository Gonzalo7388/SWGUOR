/**
 * Service de Inventario con RPC
 * Gestiona operaciones de stock, movimientos y reservas
 */

import { prisma } from "@/lib/prisma";
import {
  insertarMovimiento,
  obtenerStockDisponible,
  validarStockSuficiente,
  crearNotificacion,
} from "@/lib/helpers/rpc-helpers";
import { almacen_stock, movimientos_inventario } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// ============================================================================
// TIPOS
// ============================================================================

export interface StockPorAlmacen {
  almacenId: number;
  almacenNombre: string;
  cantidad: number;
  stockMinimo: number;
  disponible: number;
}

export interface MovimientoInventarioConDetalles extends movimientos_inventario {
  descripcion?: string;
  usuario?: { id: number; email: string } | null;
}

// ============================================================================
// OPERACIONES DE STOCK
// ============================================================================

/**
 * Obtiene el stock actual de un producto en todos los almacenes
 */
export async function obtenerStockProducto(
  productoId: number
): Promise<StockPorAlmacen[]> {
  try {
    const stocks = await prisma.almacen_stock.findMany({
      where: { producto_id: productoId },
      include: {
        almacenes: {
          select: { id: true, nombre: true },
        },
      },
    });

    return stocks.map((s) => ({
      almacenId: s.almacen_id,
      almacenNombre: s.almacenes?.nombre || "Desconocido",
      cantidad: Number(s.cantidad || 0),
      stockMinimo: Number(s.stock_minimo || 0),
      disponible: Number((s.cantidad || 0) - (s.stock_minimo || 0)),
    }));
  } catch (error) {
    console.error("Error en obtenerStockProducto:", error);
    throw new Error("No se pudo obtener el stock del producto");
  }
}

/**
 * Obtiene stock de insumo por almacén
 */
export async function obtenerStockInsumo(
  insumoId: number
): Promise<StockPorAlmacen[]> {
  try {
    const stocks = await prisma.almacen_stock.findMany({
      where: { insumo_id: insumoId },
      include: {
        almacenes: {
          select: { id: true, nombre: true },
        },
      },
    });

    return stocks.map((s) => ({
      almacenId: s.almacen_id,
      almacenNombre: s.almacenes?.nombre || "Desconocido",
      cantidad: Number(s.cantidad || 0),
      stockMinimo: Number(s.stock_minimo || 0),
      disponible: Number((s.cantidad || 0) - (s.stock_minimo || 0)),
    }));
  } catch (error) {
    console.error("Error en obtenerStockInsumo:", error);
    throw new Error("No se pudo obtener el stock del insumo");
  }
}

/**
 * Obtiene stock de material por almacén
 */
export async function obtenerStockMaterial(
  materialId: number
): Promise<StockPorAlmacen[]> {
  try {
    const stocks = await prisma.almacen_stock.findMany({
      where: { material_id: materialId },
      include: {
        almacenes: {
          select: { id: true, nombre: true },
        },
      },
    });

    return stocks.map((s) => ({
      almacenId: s.almacen_id,
      almacenNombre: s.almacenes?.nombre || "Desconocido",
      cantidad: Number(s.cantidad || 0),
      stockMinimo: Number(s.stock_minimo || 0),
      disponible: Number((s.cantidad || 0) - (s.stock_minimo || 0)),
    }));
  } catch (error) {
    console.error("Error en obtenerStockMaterial:", error);
    throw new Error("No se pudo obtener el stock del material");
  }
}

/**
 * Registra una entrada de inventario
 */
export async function registrarEntrada(data: {
  productoId?: number;
  insumoId?: number;
  materialId?: number;
  almacenId: number;
  cantidad: number;
  motivo: string;
  usuarioId?: number;
  costoUnitario?: number;
  tipoReferencia: "COMPRA" | "AJUSTE" | "DEVOLUCCION" | "REEMPLAZO";
  referenciaId: number;
}): Promise<movimientos_inventario> {
  try {
    // Registrar movimiento
    const movimiento = await prisma.movimientos_inventario.create({
      data: {
        producto_id: data.productoId,
        insumo_id: data.insumoId,
        material_id: data.materialId,
        almacen_id: data.almacenId,
        cantidad: data.cantidad,
        motivo: data.motivo,
        usuario_id: data.usuarioId,
        tipo_movimiento: "entrada",
        referencia_tipo: data.tipoReferencia,
        referencia_id: data.referenciaId,
      },
    });

    // Intentar registrar también mediante RPC
    await insertarMovimiento({
      tipoMovimiento: "entrada",
      referenciaType: data.tipoReferencia,
      referenciaId: data.referenciaId,
      cantidad: data.cantidad,
      motivo: data.motivo,
      productoId: data.productoId,
      insumoId: data.insumoId,
      materialId: data.materialId,
      costoUnitario: data.costoUnitario,
      usuarioId: data.usuarioId,
    }).catch(() => null);

    return movimiento;
  } catch (error) {
    console.error("Error en registrarEntrada:", error);
    throw new Error("No se pudo registrar la entrada");
  }
}

/**
 * Registra una salida de inventario
 */
export async function registrarSalida(data: {
  productoId?: number;
  insumoId?: number;
  materialId?: number;
  almacenId: number;
  cantidad: number;
  motivo: string;
  usuarioId?: number;
  tipoReferencia: "VENTA" | "PRODUCCION" | "AJUSTE" | "TRANSFERENCIA";
  referenciaId: number;
}): Promise<movimientos_inventario> {
  try {
    // Validar stock suficiente
    if (data.productoId) {
      const tieneSuficiente = await validarStockSuficiente(
        data.productoId,
        data.cantidad
      );
      if (!tieneSuficiente) {
        throw new Error("Stock insuficiente para esta operación");
      }
    }

    const movimiento = await prisma.movimientos_inventario.create({
      data: {
        producto_id: data.productoId,
        insumo_id: data.insumoId,
        material_id: data.materialId,
        almacen_id: data.almacenId,
        cantidad: data.cantidad,
        motivo: data.motivo,
        usuario_id: data.usuarioId,
        tipo_movimiento: "salida",
        referencia_tipo: data.tipoReferencia,
        referencia_id: data.referenciaId,
      },
    });

    // Registrar mediante RPC
    await insertarMovimiento({
      tipoMovimiento: "salida",
      referenciaType: data.tipoReferencia,
      referenciaId: data.referenciaId,
      cantidad: data.cantidad,
      motivo: data.motivo,
      productoId: data.productoId,
      insumoId: data.insumoId,
      materialId: data.materialId,
      usuarioId: data.usuarioId,
    }).catch(() => null);

    return movimiento;
  } catch (error) {
    console.error("Error en registrarSalida:", error);
    throw new Error("No se pudo registrar la salida");
  }
}

/**
 * Registra un ajuste de inventario
 */
export async function registrarAjuste(data: {
  productoId?: number;
  insumoId?: number;
  materialId?: number;
  almacenId: number;
  cantidadAnterior: number;
  cantidadNueva: number;
  motivo: string;
  usuarioId?: number;
}): Promise<movimientos_inventario> {
  try {
    const cantidad =
      cantidadNueva - data.cantidadAnterior;
    const tipoMovimiento = cantidad > 0 ? "entrada" : "salida";

    const movimiento = await prisma.movimientos_inventario.create({
      data: {
        producto_id: data.productoId,
        insumo_id: data.insumoId,
        material_id: data.materialId,
        almacen_id: data.almacenId,
        cantidad: Math.abs(cantidad),
        motivo: `Ajuste: ${data.motivo} (${data.cantidadAnterior} → ${data.cantidadNueva})`,
        usuario_id: data.usuarioId,
        tipo_movimiento: tipoMovimiento,
        referencia_tipo: "AJUSTE",
        referencia_id: 0,
      },
    });

    return movimiento;
  } catch (error) {
    console.error("Error en registrarAjuste:", error);
    throw new Error("No se pudo registrar el ajuste");
  }
}

// ============================================================================
// CONSULTAS DE MOVIMIENTOS
// ============================================================================

/**
 * Obtiene movimientos recientes de un producto
 */
export async function obtenerMovimientosProducto(
  productoId: number,
  limit: number = 50
): Promise<MovimientoInventarioConDetalles[]> {
  try {
    const movimientos = await prisma.movimientos_inventario.findMany({
      where: { producto_id: productoId },
      include: {
        usuarios: {
          select: { id: true, email: true },
        },
      },
      orderBy: { created_at: "desc" },
      take: limit,
    });

    return movimientos as any;
  } catch (error) {
    console.error("Error en obtenerMovimientosProducto:", error);
    throw new Error("No se pudieron obtener los movimientos");
  }
}

/**
 * Obtiene movimientos por tipo y fecha
 */
export async function filtrarMovimientos(data: {
  tipoMovimiento?: "entrada" | "salida" | "ajuste";
  referenciaType?: string;
  almacenId?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  limit?: number;
  offset?: number;
}): Promise<MovimientoInventarioConDetalles[]> {
  try {
    const movimientos = await prisma.movimientos_inventario.findMany({
      where: {
        tipo_movimiento: data.tipoMovimiento,
        referencia_tipo: data.referenciaType,
        almacen_id: data.almacenId,
        created_at: {
          gte: data.fechaInicio,
          lte: data.fechaFin,
        },
      },
      include: {
        usuarios: {
          select: { id: true, email: true },
        },
      },
      orderBy: { created_at: "desc" },
      take: data.limit || 50,
      skip: data.offset || 0,
    });

    return movimientos as any;
  } catch (error) {
    console.error("Error en filtrarMovimientos:", error);
    throw new Error("No se pudieron filtrar los movimientos");
  }
}

/**
 * Obtiene resumen de movimientos por período
 */
export async function obtenerResumenMovimientos(data: {
  fechaInicio: Date;
  fechaFin: Date;
  almacenId?: number;
}): Promise<{
  totalEntradas: number;
  totalSalidas: number;
  totalAjustes: number;
  montoTotalEntradas: number;
  montoTotalSalidas: number;
}> {
  try {
    const movimientos = await prisma.movimientos_inventario.findMany({
      where: {
        created_at: {
          gte: data.fechaInicio,
          lte: data.fechaFin,
        },
        almacen_id: data.almacenId,
      },
    });

    const resumen = {
      totalEntradas: movimientos.filter((m) => m.tipo_movimiento === "entrada")
        .length,
      totalSalidas: movimientos.filter((m) => m.tipo_movimiento === "salida")
        .length,
      totalAjustes: movimientos.filter((m) => m.tipo_movimiento === "ajuste")
        .length,
      montoTotalEntradas: 0,
      montoTotalSalidas: 0,
    };

    return resumen;
  } catch (error) {
    console.error("Error en obtenerResumenMovimientos:", error);
    throw new Error("No se pudo obtener el resumen de movimientos");
  }
}

/**
 * Detecta items con stock bajo
 */
export async function obtenerItemsConStockBajo(
  almacenId?: number
): Promise<
  Array<{
    tipo: "producto" | "insumo" | "material";
    id: number;
    nombre: string;
    stock: number;
    minimo: number;
  }>
> {
  try {
    const stocksBajos = await prisma.almacen_stock.findMany({
      where: {
        almacen_id: almacenId,
      },
      include: {
        productos: { select: { nombre: true } },
        insumo: { select: { nombre: true } },
        materiales: { select: { nombre: true } },
      },
    });

    return stocksBajos
      .filter(
        (s) =>
          (s.cantidad || 0) <=
          ((s.stock_minimo || 0) * 1.2)
      )
      .map((s) => {
        if (s.producto_id) {
          return {
            tipo: "producto",
            id: s.producto_id,
            nombre: s.productos?.nombre || "Desconocido",
            stock: Number(s.cantidad || 0),
            minimo: Number(s.stock_minimo || 0),
          };
        } else if (s.insumo_id) {
          return {
            tipo: "insumo",
            id: s.insumo_id,
            nombre: s.insumo?.nombre || "Desconocido",
            stock: Number(s.cantidad || 0),
            minimo: Number(s.stock_minimo || 0),
          };
        } else {
          return {
            tipo: "material",
            id: s.material_id || 0,
            nombre: s.materiales?.nombre || "Desconocido",
            stock: Number(s.cantidad || 0),
            minimo: Number(s.stock_minimo || 0),
          };
        }
      });
  } catch (error) {
    console.error("Error en obtenerItemsConStockBajo:", error);
    throw new Error("No se pudieron obtener items con stock bajo");
  }
}

export default {
  obtenerStockProducto,
  obtenerStockInsumo,
  obtenerStockMaterial,
  registrarEntrada,
  registrarSalida,
  registrarAjuste,
  obtenerMovimientosProducto,
  filtrarMovimientos,
  obtenerResumenMovimientos,
  obtenerItemsConStockBajo,
};

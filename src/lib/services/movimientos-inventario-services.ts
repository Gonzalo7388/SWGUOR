// lib/services/movimientos-inventario-services.ts

import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils/serialize";
import type { ReferenciaMovimiento, TipoMovimiento } from "@prisma/client";

export interface RegistrarParams {
  insumo_id?: string | number;
  material_id?: string | number;
  producto_id?: string | number;
  cantidad: number;
  tipo_movimiento: TipoMovimiento;
  referencia_tipo: ReferenciaMovimiento;
  motivo: string;
  usuario_id?: string | number;
  almacen_id?: string | number;
  costo_unitario?: number;
  referencia_id?: string | number;
}

export interface ListarParams {
  desde?: Date;
  hasta?: Date;
  tipo_movimiento?: TipoMovimiento;
  referencia_tipo?: ReferenciaMovimiento;
  producto_id?: string;
  insumo_id?: string;
  material_id?: string;
  usuario_id?: string;
  almacen_id?: string;
  busqueda?: string;
  limite?: number;
}

export const MovimientosInventarioService = {
  /**
   * Registra un movimiento de inventario y actualiza el stock correspondiente.
   */
  async registrar(params: RegistrarParams) {
    const {
      insumo_id,
      material_id,
      producto_id,
      cantidad,
      tipo_movimiento,
      referencia_tipo,
      motivo,
      usuario_id,
      almacen_id,
      costo_unitario,
      referencia_id,
    } = params;

    if (!insumo_id && !material_id && !producto_id) {
      throw new Error("Debe proporcionar ID de insumo, material o producto");
    }

    if (cantidad <= 0) {
      throw new Error("La cantidad debe ser mayor a 0");
    }

    return prisma.$transaction(async (tx) => {
      // ─── Insumo ───────────────────────────────────────────────────────────
      if (insumo_id) {
        const insumo = await tx.insumo.findUniqueOrThrow({
          where: { id: BigInt(insumo_id) },
        });

        const stockAnterior = Number(insumo.stock_actual);
        const stockPosterior =
          tipo_movimiento === "entrada"
            ? stockAnterior + cantidad
            : tipo_movimiento === "salida"
              ? stockAnterior - cantidad
              : stockAnterior;

        if (stockPosterior < 0) {
          throw new Error(
            `Stock insuficiente para insumo "${insumo.nombre}". Stock actual: ${stockAnterior}`
          );
        }

        await tx.insumo.update({
          where: { id: BigInt(insumo_id) },
          data: {
            stock_actual: stockPosterior,
            updated_at: new Date(),
            ...(costo_unitario != null && { precio_unitario: costo_unitario }),
          },
        });
      }

      // ─── Material ─────────────────────────────────────────────────────────
      if (material_id) {
        const material = await tx.materiales.findUniqueOrThrow({
          where: { id: BigInt(material_id) },
        });

        const stockAnterior = Number(material.stock_actual);
        const stockPosterior =
          tipo_movimiento === "entrada"
            ? stockAnterior + cantidad
            : tipo_movimiento === "salida"
              ? stockAnterior - cantidad
              : stockAnterior;

        if (stockPosterior < 0) {
          throw new Error(
            `Stock insuficiente para material "${material.nombre}". Stock actual: ${stockAnterior}`
          );
        }

        await tx.materiales.update({
          where: { id: BigInt(material_id) },
          data: {
            stock_actual: stockPosterior,
            updated_at: new Date(),
            ...(costo_unitario != null && { precio_unitario: costo_unitario }),
          },
        });
      }

      // ─── Producto ─────────────────────────────────────────────────────────
      if (producto_id) {
        const producto = await tx.productos.findUniqueOrThrow({
          where: { id: BigInt(producto_id) },
        });

        const stockAnterior = Number(producto.stock);
        const stockPosterior =
          tipo_movimiento === "entrada"
            ? stockAnterior + cantidad
            : tipo_movimiento === "salida"
              ? stockAnterior - cantidad
              : stockAnterior;

        if (stockPosterior < 0) {
          throw new Error(
            `Stock insuficiente para producto "${producto.nombre}". Stock actual: ${stockAnterior}`
          );
        }

        await tx.productos.update({
          where: { id: BigInt(producto_id) },
          data: {
            stock: stockPosterior,
            updated_at: new Date(),
          },
        });
      }

      // ─── Registro del movimiento ──────────────────────────────────────────
      const movimiento = await tx.movimientos_inventario.create({
        data: {
          insumo_id:      insumo_id    ? BigInt(insumo_id)    : null,
          material_id:    material_id  ? BigInt(material_id)  : null,
          producto_id:    producto_id  ? BigInt(producto_id)  : null,
          cantidad,
          tipo_movimiento,
          referencia_tipo,
          motivo,
          usuario_id:     usuario_id   ? BigInt(usuario_id)   : null,
          almacen_id:     almacen_id   ? BigInt(almacen_id)   : null,
          costo_unitario: costo_unitario ?? null,
          referencia_id:  referencia_id ? BigInt(referencia_id) : null,
          created_at: new Date(),
        },
        include: {
          insumo:     { select: { id: true, nombre: true, unidad_medida: true } },
          materiales: { select: { id: true, nombre: true } }, 
          productos:  { select: { id: true, nombre: true } }, 
          usuarios:   { select: { id: true, email: true } },
        },
      });

      return serializeBigInt(movimiento);
    });
  },

  /**
   * Lista movimientos con filtros opcionales.
   */
  async listar(params?: ListarParams) {
    const where: Record<string, any> = {};

    if (params?.desde || params?.hasta) {
      where.created_at = {
        ...(params.desde && { gte: params.desde }),
        ...(params.hasta && { lte: params.hasta }),
      };
    }
    if (params?.tipo_movimiento)  where.tipo_movimiento  = params.tipo_movimiento;
    if (params?.referencia_tipo)  where.referencia_tipo  = params.referencia_tipo;
    if (params?.producto_id)      where.producto_id      = BigInt(params.producto_id);
    if (params?.material_id)      where.material_id      = BigInt(params.material_id);
    if (params?.insumo_id)        where.insumo_id        = BigInt(params.insumo_id);
    if (params?.usuario_id)       where.usuario_id       = BigInt(params.usuario_id);
    if (params?.almacen_id)       where.almacen_id       = BigInt(params.almacen_id);

    const movimientos = await prisma.movimientos_inventario.findMany({
      where,
      include: {
        insumo:     { select: { id: true, nombre: true, unidad_medida: true } },
        materiales: { select: { id: true, nombre: true } },
        productos:  { select: { id: true, nombre: true } },
        usuarios:   { select: { id: true, email: true } },
      },
      orderBy: { created_at: "desc" },
      take: params?.limite ?? 100,
    });

    let resultado = serializeBigInt(movimientos);

    // Búsqueda en cliente (cruza nombre del ítem y motivo)
    if (params?.busqueda) {
      const q = params.busqueda.toLowerCase();
      resultado = resultado.filter((mov: any) => {
        const nombre =
          mov.insumo?.nombre ??
          mov.materiales?.nombre ??
          mov.productos?.nombre ??
          "";
        return (
          nombre.toLowerCase().includes(q) ||
          (mov.motivo ?? "").toLowerCase().includes(q)
        );
      });
    }

    return resultado;
  },

  /**
   * Estadísticas/resumen de movimientos.
   */
  async obtenerResumen(params?: { tipo_movimiento?: TipoMovimiento; desde?: Date; hasta?: Date }) {
    const where: Record<string, any> = {};

    if (params?.tipo_movimiento) where.tipo_movimiento = params.tipo_movimiento;
    if (params?.desde || params?.hasta) {
      where.created_at = {
        ...(params.desde && { gte: params.desde }),
        ...(params.hasta && { lte: params.hasta }),
      };
    }

    const [totalEntradas, totalSalidas, totalAjustes, totalMovimientos, movimientos] =
      await Promise.all([
        prisma.movimientos_inventario.count({ where: { ...where, tipo_movimiento: "entrada" } }),
        prisma.movimientos_inventario.count({ where: { ...where, tipo_movimiento: "salida"  } }),
        prisma.movimientos_inventario.count({ where: { ...where, tipo_movimiento: "ajuste"  } }),
        prisma.movimientos_inventario.count({ where }),
        prisma.movimientos_inventario.findMany({
          where,
          select: { tipo_movimiento: true, cantidad: true, costo_unitario: true },
        }),
      ]);

    const sum = (tipo: TipoMovimiento) =>
      movimientos
        .filter((m) => m.tipo_movimiento === tipo)
        .reduce((acc, m) => acc + Number(m.costo_unitario ?? 0) * Number(m.cantidad ?? 0), 0);

    return {
      totalEntradas,
      totalSalidas,
      totalAjustes,
      totalMovimientos,
      montoTotalEntradas: sum("entrada"),
      montoTotalSalidas:  sum("salida"),
    };
  },
};
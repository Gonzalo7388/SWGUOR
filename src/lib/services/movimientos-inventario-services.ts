import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils/serialize";
import type {
  ReferenciaMovimiento,
  TipoMovimiento,
} from "@prisma/client";

export interface RegistroMovimientoParams {
  // Item a mover (uno de estos debe estar presente)
  insumo_id?: string;
  material_id?: string;
  producto_id?: string;

  // Datos del movimiento
  cantidad: number;
  tipo_movimiento: TipoMovimiento;
  referencia_tipo: ReferenciaMovimiento;
  motivo: string;

  // Opcional
  usuario_id?: string;
  almacen_id?: string;
  costo_unitario?: number;
  referencia_id?: string;
}

export interface MovimientosFiltersParams {
  desde?: string;
  hasta?: string;
  tipo?: TipoMovimiento;
  referencia?: ReferenciaMovimiento;
  tipoItem?: "producto" | "insumo" | "material";
  busqueda?: string;
  limite?: number;
}

export const MovimientosInventarioService = {
  /**
   * Registra un movimiento de inventario genérico
   */
  async registrarMovimiento(params: RegistroMovimientoParams) {
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
      throw new Error(
        "Debe proporcionar ID de insumo, material o producto"
      );
    }

    if (cantidad <= 0) {
      throw new Error("La cantidad debe ser mayor a 0");
    }

    return prisma.$transaction(async (tx) => {
      let stockAnterior = 0;
      let stockPosterior = 0;

      // Actualizar stock correspondiente
      if (insumo_id) {
        const insumo = await tx.insumo.findUniqueOrThrow({
          where: { id: BigInt(insumo_id) },
        });
        stockAnterior = Number(insumo.stock_actual);
        stockPosterior =
          tipo_movimiento === "entrada"
            ? stockAnterior + cantidad
            : tipo_movimiento === "salida"
              ? stockAnterior - cantidad
              : stockAnterior;

        if (stockPosterior < 0) {
          throw new Error(
            `Stock insuficiente para insumo. Stock actual: ${stockAnterior}`
          );
        }

        await tx.insumo.update({
          where: { id: BigInt(insumo_id) },
          data: {
            stock: stockPosterior,
            updated_at: new Date(),
            ...(costo_unitario && { precio_unitario: costo_unitario }),
          },
        });
      }

      if (material_id) {
        const material = await tx.materiales.findUniqueOrThrow({
          where: { id: BigInt(material_id) },
        });
        stockAnterior = Number(material.stock_actual);
        stockPosterior =
          tipo_movimiento === "entrada"
            ? stockAnterior + cantidad
            : tipo_movimiento === "salida"
              ? stockAnterior - cantidad
              : stockAnterior;

        if (stockPosterior < 0) {
          throw new Error(
            `Stock insuficiente para material. Stock actual: ${stockAnterior}`
          );
        }

        await tx.materiales.update({
          where: { id: BigInt(material_id) },
          data: {
            stock: stockPosterior,
            updated_at: new Date(),
            ...(costo_unitario && { precio_unitario: costo_unitario }),
          },
        });
      }

      if (producto_id) {
        const producto = await tx.productos.findUniqueOrThrow({
          where: { id: BigInt(producto_id) },
        });
        stockAnterior = Number(producto.stock);
        stockPosterior =
          tipo_movimiento === "entrada"
            ? stockAnterior + cantidad
            : tipo_movimiento === "salida"
              ? stockAnterior - cantidad
              : stockAnterior;

        if (stockPosterior < 0) {
          throw new Error(
            `Stock insuficiente para producto. Stock actual: ${stockAnterior}`
          );
        }

        await tx.productos.update({
          where: { id: BigInt(producto_id) },
          data: {
            stock_actual: stockPosterior,
            updated_at: new Date(),
          },
        });
      }

      // Crear registro de movimiento
      const movimiento = await tx.movimientos_inventario.create({
        data: {
          insumo_id: insumo_id ? BigInt(insumo_id) : null,
          material_id: material_id ? BigInt(material_id) : null,
          producto_id: producto_id ? BigInt(producto_id) : null,
          cantidad,
          tipo_movimiento,
          referencia_tipo,
          motivo,
          usuario_id: usuario_id ? BigInt(usuario_id) : null,
          almacen_id: almacen_id ? BigInt(almacen_id) : null,
          costo_unitario: costo_unitario ? Number(costo_unitario) : null,
          referencia_id: referencia_id ? BigInt(referencia_id) : null,
          stock_anterior: stockAnterior,
          stock_posterior: stockPosterior,
          created_at: new Date(),
        },
        include: {
          insumo: true,
          material: true,
          producto: true,
          usuario: {
            select: { id: true, nombre: true, email: true },
          },
        },
      });

      return serializeBigInt(movimiento);
    });
  },

  /**
   * Registra una entrada de compra (proveedor)
   */
  async registrarCompra(params: {
    insumo_id?: string;
    material_id?: string;
    cantidad: number;
    costo_unitario: number;
    usuario_id?: string;
    orden_compra_id?: string;
    motivo?: string;
  }) {
    return this.registrarMovimiento({
      insumo_id: params.insumo_id,
      material_id: params.material_id,
      cantidad: params.cantidad,
      tipo_movimiento: "entrada",
      referencia_tipo: "COMPRA",
      motivo:
        params.motivo || `Compra de insumo/material a proveedor`,
      usuario_id: params.usuario_id,
      costo_unitario: params.costo_unitario,
      referencia_id: params.orden_compra_id,
    });
  },

  /**
   * Registra una devolución a proveedor
   */
  async registrarDevolucionProveedor(params: {
    insumo_id?: string;
    material_id?: string;
    cantidad: number;
    costo_unitario: number;
    usuario_id?: string;
    devolucion_id?: string;
    motivo: string;
  }) {
    return this.registrarMovimiento({
      insumo_id: params.insumo_id,
      material_id: params.material_id,
      cantidad: params.cantidad,
      tipo_movimiento: "salida",
      referencia_tipo: "COMPRA",
      motivo: `Devolución a proveedor: ${params.motivo}`,
      usuario_id: params.usuario_id,
      costo_unitario: params.costo_unitario,
      referencia_id: params.devolucion_id,
    });
  },

  /**
   * Registra una venta de producto
   */
  async registrarVenta(params: {
    producto_id: string;
    cantidad: number;
    usuario_id?: string;
    pedido_id?: string;
    motivo?: string;
  }) {
    return this.registrarMovimiento({
      producto_id: params.producto_id,
      cantidad: params.cantidad,
      tipo_movimiento: "salida",
      referencia_tipo: "VENTA",
      motivo: params.motivo || "Venta de producto",
      usuario_id: params.usuario_id,
      referencia_id: params.pedido_id,
    });
  },

  /**
   * Registra una devolución de cliente
   */
  async registrarDevolucionCliente(params: {
    producto_id: string;
    cantidad: number;
    usuario_id?: string;
    devolucion_id?: string;
    motivo: string;
  }) {
    return this.registrarMovimiento({
      producto_id: params.producto_id,
      cantidad: params.cantidad,
      tipo_movimiento: "entrada",
      referencia_tipo: "VENTA",
      motivo: `Devolución de cliente: ${params.motivo}`,
      usuario_id: params.usuario_id,
      referencia_id: params.devolucion_id,
    });
  },

  /**
   * Registra consumo de insumos/materiales en fabricación
   */
  async registrarConsumoFabricacion(params: {
    insumo_id?: string;
    material_id?: string;
    cantidad: number;
    usuario_id?: string;
    confeccion_id?: string;
    motivo?: string;
  }) {
    return this.registrarMovimiento({
      insumo_id: params.insumo_id,
      material_id: params.material_id,
      cantidad: params.cantidad,
      tipo_movimiento: "salida",
      referencia_tipo: "AJUSTE",
      motivo: params.motivo || "Consumo en fabricación",
      usuario_id: params.usuario_id,
      referencia_id: params.confeccion_id,
    });
  },

  /**
   * Registra un ingreso de stock (reposición)
   */
  async registrarIngresoStock(params: {
    insumo_id?: string;
    material_id?: string;
    producto_id?: string;
    cantidad: number;
    usuario_id?: string;
    motivo?: string;
  }) {
    return this.registrarMovimiento({
      insumo_id: params.insumo_id,
      material_id: params.material_id,
      producto_id: params.producto_id,
      cantidad: params.cantidad,
      tipo_movimiento: "entrada",
      referencia_tipo: "AJUSTE",
      motivo: params.motivo || "Ingreso manual de stock",
      usuario_id: params.usuario_id,
    });
  },

  /**
   * Registra una incidencia de producto/insumo/material
   */
  async registrarIncidencia(params: {
    insumo_id?: string;
    material_id?: string;
    producto_id?: string;
    cantidad: number;
    usuario_id?: string;
    incidencia_id?: string;
    motivo: string;
  }) {
    return this.registrarMovimiento({
      insumo_id: params.insumo_id,
      material_id: params.material_id,
      producto_id: params.producto_id,
      cantidad: params.cantidad,
      tipo_movimiento: "salida",
      referencia_tipo: "AJUSTE",
      motivo: `Incidencia: ${params.motivo}`,
      usuario_id: params.usuario_id,
      referencia_id: params.incidencia_id,
    });
  },

  /**
   * Listar movimientos con filtros
   */
  async listarMovimientos(params?: MovimientosFiltersParams) {
    const where: any = {};

    // Filtros de fecha
    if (params?.desde || params?.hasta) {
      where.created_at = {
        ...(params.desde && { gte: new Date(params.desde) }),
        ...(params.hasta && { lte: new Date(params.hasta) }),
      };
    }

    // Filtro de tipo de movimiento
    if (params?.tipo) {
      where.tipo_movimiento = params.tipo;
    }

    // Filtro de referencia
    if (params?.referencia) {
      where.referencia_tipo = params.referencia;
    }

    // Filtro de tipo de item
    if (params?.tipoItem) {
      if (params.tipoItem === "insumo") {
        where.insumo_id = { not: null };
      } else if (params.tipoItem === "material") {
        where.material_id = { not: null };
      } else if (params.tipoItem === "producto") {
        where.producto_id = { not: null };
      }
    }

    const movimientos = await prisma.movimientos_inventario.findMany({
      where,
      include: {
        insumo: {
          select: { id: true, nombre: true, unidad_medida: true },
        },
        material: {
          select: { id: true, nombre: true },
        },
        producto: {
          select: { id: true, nombre: true },
        },
        usuario: {
          select: { id: true, nombre: true, email: true },
        },
      },
      orderBy: { created_at: "desc" },
      take: params?.limite ?? 100,
    });

    // Filtro de búsqueda (en cliente porque requiere búsqueda en relaciones)
    let resultado = serializeBigInt(movimientos);

    if (params?.busqueda) {
      const searchLower = params.busqueda.toLowerCase();
      resultado = resultado.filter((mov: any) => {
        const itemName =
          mov.insumo?.nombre ||
          mov.material?.nombre ||
          mov.producto?.nombre ||
          "";
        const motivo = mov.motivo || "";

        return (
          itemName.toLowerCase().includes(searchLower) ||
          motivo.toLowerCase().includes(searchLower)
        );
      });
    }

    return resultado;
  },

  /**
   * Obtener estadísticas de movimientos
   */
  async obtenerEstadisticas(params?: {
    desde?: string;
    hasta?: string;
  }) {
    const where: any = {};

    if (params?.desde || params?.hasta) {
      where.created_at = {
        ...(params.desde && { gte: new Date(params.desde) }),
        ...(params.hasta && { lte: new Date(params.hasta) }),
      };
    }

    const [totalEntradas, totalSalidas, totalAjustes, totalMovimientos] =
      await Promise.all([
        prisma.movimientos_inventario.count({
          where: { ...where, tipo_movimiento: "entrada" },
        }),
        prisma.movimientos_inventario.count({
          where: { ...where, tipo_movimiento: "salida" },
        }),
        prisma.movimientos_inventario.count({
          where: { ...where, tipo_movimiento: "ajuste" },
        }),
        prisma.movimientos_inventario.count({
          where,
        }),
      ]);

    // Calcular montos
    const movimientos = await prisma.movimientos_inventario.findMany({
      where,
      select: {
        tipo_movimiento: true,
        cantidad: true,
        costo_unitario: true,
      },
    });

    const montoTotalEntradas = movimientos
      .filter((m) => m.tipo_movimiento === "entrada")
      .reduce((sum, m) => {
        const costo = Number(m.costo_unitario || 0);
        const cant = Number(m.cantidad || 0);
        return sum + (costo * cant);
      }, 0);

    const montoTotalSalidas = movimientos
      .filter((m) => m.tipo_movimiento === "salida")
      .reduce((sum, m) => {
        const costo = Number(m.costo_unitario || 0);
        const cant = Number(m.cantidad || 0);
        return sum + (costo * cant);
      }, 0);

    return {
      totalEntradas,
      totalSalidas,
      totalAjustes,
      totalMovimientos,
      montoTotalEntradas,
      montoTotalSalidas,
    };
  },
};

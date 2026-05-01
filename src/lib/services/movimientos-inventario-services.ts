import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import type { TipoMovimiento, ReferenciaMovimiento } from '@prisma/client';

/**
 * ARQUITECTURA DE MOVIMIENTOS DE INVENTARIO
 * 
 * Este servicio es el punto central para registrar TODOS los cambios de inventario.
 * Se integra automáticamente con:
 * - Compra de materiales/insumos (ordenes_compra)
 * - Venta de productos (ordenes_venta)
 * - Producción (uso de materiales en confecciones)
 * - Devoluciones (cliente/proveedor)
 * - Incidencias (pérdidas, daños)
 * - Ajustes manuales (errores de conteo)
 */

export const MovimientosInventarioService = {
  /**
   * Registra un movimiento completo con validaciones y trazabilidad
   * Esta es la función principal que se llama desde todos lados
   */
  async registrar(data: {
    // Identificar qué se mueve (solo uno es requerido)
    producto_id?: string | number;
    material_id?: string | number;
    insumo_id?: string | number;

    // Datos del movimiento
    cantidad: number; // Siempre positivo, el tipo_movimiento indica entrada/salida
    tipo_movimiento: TipoMovimiento;
    motivo: string; // Descripción clara: "Compra OC-001", "Producción CF-005", etc.

    // Costos (para entrada principalmente)
    costo_unitario?: number; // Para actualizar precio cuando entra material
    
    // Trazabilidad
    usuario_id?: string | number;
    almacen_id?: string | number;
    referencia_tipo?: ReferenciaMovimiento; // ORDEN, COMPRA, VENTA, AJUSTE
    referencia_id?: string | number; // ID de la orden, OC, OV, etc.
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Validar que al menos un item se especifique
      const itemId = data.producto_id || data.material_id || data.insumo_id;
      const itemType = data.producto_id ? 'producto' : data.material_id ? 'material' : 'insumo';
      
      if (!itemId) {
        throw new Error('Debe especificar producto, material o insumo');
      }

      // 2. Obtener datos actuales según tipo
      const stockActual = await this._obtenerStockActual(tx, itemType, itemId);
      
      // 3. Calcular nuevo stock
      const cantidad = Math.abs(data.cantidad);
      const cambio = data.tipo_movimiento === 'salida' ? -cantidad : cantidad;
      const nuevoStock = stockActual.stock + cambio;

      // Validación: no permitir stock negativo en salidas
      if (nuevoStock < 0) {
        throw new Error(
          `Stock insuficiente. Stock actual: ${stockActual.stock}, solicitado: ${cantidad}`
        );
      }

      // 4. Crear registro de movimiento
      const movimiento = await tx.movimientos_inventario.create({
        data: {
          producto_id: data.producto_id ? BigInt(data.producto_id) : null,
          material_id: data.material_id ? BigInt(data.material_id) : null,
          insumo_id: data.insumo_id ? BigInt(data.insumo_id) : null,
          cantidad: cantidad,
          tipo_movimiento: data.tipo_movimiento,
          motivo: data.motivo,
          costo_unitario: data.costo_unitario ?? null,
          usuario_id: data.usuario_id ? BigInt(data.usuario_id) : null,
          almacen_id: data.almacen_id ? BigInt(data.almacen_id) : null,
          referencia_tipo: data.referencia_tipo ?? null,
          referencia_id: data.referencia_id ? BigInt(data.referencia_id) : null,
        },
        include: {
          usuarios: { select: { id: true, email: true } },
          almacenes: { select: { id: true, nombre: true } },
          productos: { select: { id: true, nombre: true, sku: true } },
          materiales: { select: { id: true, nombre: true } },
          insumo: { select: { id: true, nombre: true } },
        },
      });

      // 5. Actualizar stock en tabla maestra
      await this._actualizarStock(tx, itemType, itemId, nuevoStock, data.costo_unitario);

      return serializeBigInt(movimiento);
    });
  },

  /**
   * Obtiene el stock actual de un item según su tipo
   */
  async _obtenerStockActual(
    tx: any,
    tipo: 'producto' | 'material' | 'insumo',
    id: string | number
  ) {
    const bigId = BigInt(id);

    if (tipo === 'producto') {
      const producto = await tx.productos.findUnique({
        where: { id: bigId },
        select: { stock: true },
      });
      if (!producto) throw new Error('Producto no encontrado');
      return { stock: Number(producto.stock) };
    }

    if (tipo === 'material') {
      const material = await tx.materiales.findUnique({
        where: { id: bigId },
        select: { stock_actual: true },
      });
      if (!material) throw new Error('Material no encontrado');
      return { stock: Number(material.stock_actual) };
    }

    // insumo
    const insumo = await tx.insumo.findUnique({
      where: { id: bigId },
      select: { stock: true },
    });
    if (!insumo) throw new Error('Insumo no encontrado');
    return { stock: Number(insumo.stock) };
  },

  /**
   * Actualiza el stock en la tabla maestra
   */
  async _actualizarStock(
    tx: any,
    tipo: 'producto' | 'material' | 'insumo',
    id: string | number,
    nuevoStock: number,
    costo_unitario?: number
  ) {
    const bigId = BigInt(id);
    const updateData: any = { updated_at: new Date() };

    if (tipo === 'producto') {
      updateData.stock = nuevoStock;
      return tx.productos.update({ where: { id: bigId }, data: updateData });
    }

    if (tipo === 'material') {
      updateData.stock_actual = nuevoStock;
      if (costo_unitario) updateData.precio_unitario = costo_unitario;
      return tx.materiales.update({ where: { id: bigId }, data: updateData });
    }

    // insumo
    updateData.stock = nuevoStock;
    if (costo_unitario) updateData.precio_unitario = costo_unitario;
    return tx.insumo.update({ where: { id: bigId }, data: updateData });
  },

  /**
   * Listar movimientos con filtros avanzados
   */
  async listar(filtros?: {
    tipo_movimiento?: TipoMovimiento;
    referencia_tipo?: ReferenciaMovimiento;
    producto_id?: string;
    material_id?: string;
    insumo_id?: string;
    usuario_id?: string;
    almacen_id?: string;
    busqueda?: string; // Busca en motivo
    desde?: Date;
    hasta?: Date;
    limite?: number;
  }) {
    const where: any = {};

    if (filtros?.tipo_movimiento) where.tipo_movimiento = filtros.tipo_movimiento;
    if (filtros?.referencia_tipo) where.referencia_tipo = filtros.referencia_tipo;
    if (filtros?.producto_id) where.producto_id = BigInt(filtros.producto_id);
    if (filtros?.material_id) where.material_id = BigInt(filtros.material_id);
    if (filtros?.insumo_id) where.insumo_id = BigInt(filtros.insumo_id);
    if (filtros?.usuario_id) where.usuario_id = BigInt(filtros.usuario_id);
    if (filtros?.almacen_id) where.almacen_id = BigInt(filtros.almacen_id);
    
    if (filtros?.busqueda) {
      where.motivo = { contains: filtros.busqueda, mode: 'insensitive' };
    }

    if (filtros?.desde || filtros?.hasta) {
      where.created_at = {};
      if (filtros.desde) where.created_at.gte = filtros.desde;
      if (filtros.hasta) where.created_at.lte = filtros.hasta;
    }

    const movimientos = await prisma.movimientos_inventario.findMany({
      where,
      include: {
        usuarios: { select: { id: true, email: true } },
        almacenes: { select: { id: true, nombre: true } },
        productos: { select: { id: true, nombre: true, sku: true } },
        materiales: { select: { id: true, nombre: true } },
        insumo: { select: { id: true, nombre: true } },
      },
      orderBy: { created_at: 'desc' },
      take: filtros?.limite ?? 100,
    });

    return serializeBigInt(movimientos);
  },

  /**
   * Obtener resumen de movimientos para estadísticas
   */
  async obtenerResumen(filtros?: {
    tipo_movimiento?: TipoMovimiento;
    desde?: Date;
    hasta?: Date;
  }) {
    const where: any = {};
    if (filtros?.tipo_movimiento) where.tipo_movimiento = filtros.tipo_movimiento;
    if (filtros?.desde || filtros?.hasta) {
      where.created_at = {};
      if (filtros.desde) where.created_at.gte = filtros.desde;
      if (filtros.hasta) where.created_at.lte = filtros.hasta;
    }

    const [entradas, salidas, ajustes] = await Promise.all([
      prisma.movimientos_inventario.count({
        where: { ...where, tipo_movimiento: 'entrada' },
      }),
      prisma.movimientos_inventario.count({
        where: { ...where, tipo_movimiento: 'salida' },
      }),
      prisma.movimientos_inventario.count({
        where: { ...where, tipo_movimiento: 'ajuste' },
      }),
    ]);

    return { entradas, salidas, ajustes, total: entradas + salidas + ajustes };
  },
};
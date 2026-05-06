import { prisma }          from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import type { ReferenciaMovimiento } from '@prisma/client';
import { insertarMovimiento, obtenerStockDisponible, validarStockSuficiente } from '@/lib/helpers/rpc-helpers';

export const InventarioService = {

  async listar(params?: {
    categoria_insumo?: string;
    tipo?:             string;
    busqueda?:         string;
    bajo_stock?:       boolean;
    sort?:             'asc' | 'desc';
  }) {
    const where: any = {};
    if (params?.categoria_insumo) where.categoria_insumo = params.categoria_insumo;
    if (params?.tipo)             where.tipo             = params.tipo;
    if (params?.busqueda) {
      where.nombre = { contains: params.busqueda, mode: 'insensitive' };
    }

    const insumos = await prisma.insumo.findMany({
      where,
      include: {
        proveedores: { select: { id: true, razon_social: true } },
      },
      orderBy: params?.sort
        ? { precio_unitario: params.sort }
        : { nombre: 'asc' },
    });

    // ✅ Convertir Decimal a number antes de comparar
    const resultado = params?.bajo_stock
      ? insumos.filter(i => Number(i.stock_actual) <= Number(i.stock_minimo))
      : insumos;

    return serializeBigInt(resultado);
  },

  async obtenerPorId(id: string) {
    const insumo = await prisma.insumo.findUnique({
      where:   { id: BigInt(id) },
      include: { proveedores: { select: { id: true, razon_social: true } } },
    });
    return insumo ? serializeBigInt(insumo) : null;
  },

  async crear(data: {
    nombre:             string;
    tipo:               string;
    categoria_insumo?:  string;
    unidad_medida?:     string;
    stock_actual?:      number;
    stock_minimo?:      number;
    stock_maximo?:      number;
    precio_unitario?:   number;
    proveedor_id?:      string;
    ubicacion_almacen?: string;
    alerta_bajo_stock?: boolean;
  }) {
    const insumo = await prisma.insumo.create({
      data: {
        nombre:            data.nombre,
        tipo:              data.tipo as any,
        categoria_insumo:  (data.categoria_insumo ?? 'otro') as any,
        unidad_medida:     (data.unidad_medida ?? 'unidades') as any,
        // ✅ Convertir numbers a string para campos Decimal
        stock_actual:      (data.stock_actual    ?? 0).toString(),
        stock_minimo:      (data.stock_minimo    ?? 10).toString(),
        stock_maximo:      data.stock_maximo     != null ? data.stock_maximo.toString()    : null,
        precio_unitario:   data.precio_unitario  != null ? data.precio_unitario.toString() : null,
        proveedor_id:      data.proveedor_id ? BigInt(data.proveedor_id) : null,
        ubicacion_almacen: data.ubicacion_almacen  ?? null,
        alerta_bajo_stock: data.alerta_bajo_stock  ?? true,
      },
    });
    return serializeBigInt(insumo);
  },

  async actualizar(id: string, data: Partial<{
    nombre:             string;
    tipo:               string;
    categoria_insumo:   string;
    unidad_medida:      string;
    stock_minimo:       number;
    stock_maximo:       number;
    precio_unitario:    number;
    proveedor_id:       string;
    ubicacion_almacen:  string;
    alerta_bajo_stock:  boolean;
  }>) {
    // ✅ Convertir campos Decimal a string antes de enviar a Prisma
    const dataTransformada: any = { ...data, updated_at: new Date() };

    if (data.stock_minimo    != null) dataTransformada.stock_minimo    = data.stock_minimo.toString();
    if (data.stock_maximo    != null) dataTransformada.stock_maximo    = data.stock_maximo.toString();
    if (data.precio_unitario != null) dataTransformada.precio_unitario = data.precio_unitario.toString();
    if (data.proveedor_id    != null) dataTransformada.proveedor_id    = BigInt(data.proveedor_id);

    const insumo = await prisma.insumo.update({
      where: { id: BigInt(id) },
      data:  dataTransformada,
    });
    return serializeBigInt(insumo);
  },

  // Ajusta stock y registra movimiento en una transacción
  async ajustarStock(id: string, input: {
    stock_delta?:     number;   // relativo: +5 / -3
    stock_actual?:    number;   // absoluto: valor exacto
    motivo?:          string;
    usuario_id?:      string;
    costo_unitario?:  number;
    referencia_tipo?: ReferenciaMovimiento;
    referencia_id?:   string;
    precio_unitario?: number;
  }) {
    return prisma.$transaction(async (tx) => {
      const insumo = await tx.insumo.findUniqueOrThrow({ where: { id: BigInt(id) } });

      // ✅ Convertir Decimal a number para operar
      const stockAnterior = Number(insumo.stock_actual);
      const nuevoStock = input.stock_delta !== undefined
        ? stockAnterior + input.stock_delta
        : Number(input.stock_actual);

      if (nuevoStock < 0) {
        throw new Error(`Stock insuficiente. Actual: ${stockAnterior}`);
      }

      const tipoMovimiento =
        nuevoStock > stockAnterior ? 'entrada' :
        nuevoStock < stockAnterior ? 'salida'  : 'ajuste';

      const costoUnitario = input.costo_unitario
        ?? (insumo.precio_unitario ? Number(insumo.precio_unitario) : null);

      const [actualizado] = await Promise.all([
        tx.insumo.update({
          where: { id: BigInt(id) },
          data: {
            // ✅ Convertir number a string para Decimal
            stock_actual: nuevoStock.toString(),
            updated_at:   new Date(),
            ...(input.precio_unitario !== undefined && {
              precio_unitario: input.precio_unitario.toString(),
            }),
          },
        }),
        tx.movimientos_inventario.create({
          data: {
            insumo_id:       BigInt(id),
            cantidad:        Math.abs(nuevoStock - stockAnterior),
            motivo:          input.motivo          ?? 'Ajuste de stock manual',
            tipo_movimiento: tipoMovimiento as any,
            usuario_id:      input.usuario_id      ? BigInt(input.usuario_id) : null,
            referencia_tipo: input.referencia_tipo ?? 'AJUSTE' as ReferenciaMovimiento,
            referencia_id:   input.referencia_id   ? BigInt(input.referencia_id) : null,
          },
        }),
      ]);

      return serializeBigInt(actualizado);
    });
  },

  async eliminar(id: string) {
    await prisma.insumo.delete({ where: { id: BigInt(id) } });
    return { success: true };
  },

  async listarMovimientos(params?: {
    insumo_id?: string;
    desde?:     string;
    hasta?:     string;
    limite?:    number;
  }) {
    const movimientos = await prisma.movimientos_inventario.findMany({
      where: {
        ...(params?.insumo_id && { insumo_id: BigInt(params.insumo_id) }),
        ...((params?.desde || params?.hasta) && {
          created_at: {
            ...(params.desde && { gte: new Date(params.desde) }),
            ...(params.hasta && { lte: new Date(params.hasta) }),
          },
        }),
      },
      include: {
        insumo: { select: { id: true, nombre: true, unidad_medida: true } },
      },
      orderBy: { created_at: 'desc' },
      take:    params?.limite ?? 50,
    });
    return serializeBigInt(movimientos);
  },

  // ── FUNCIONES CON RPC ──────────────────────────────

  /**
   * Obtiene items (insumos) con stock bajo usando RPC
   */
  async obtenerStockBajo(almacenId?: number) {
    try {
      const insumosBajo = await prisma.insumo.findMany({
        where: {
          alerta_bajo_stock: true,
        },
        orderBy: { stock_actual: 'asc' },
      });

      // Filtrar aquellos cuyo stock actual <= stock mínimo
      return serializeBigInt(
        insumosBajo.filter(i => Number(i.stock_actual) <= Number(i.stock_minimo))
      );
    } catch (error) {
      console.error('Error obteniendo stock bajo:', error);
      return [];
    }
  },

  /**
   * Obtiene stock disponible considerando reservas (RPC)
   */
  async obtenerStockDisponibleProducto(productoId: number, almacenId: number) {
    try {
      const stock = await obtenerStockDisponible(productoId, almacenId);
      return stock;
    } catch (error) {
      console.error('Error obteniendo stock disponible:', error);
      return null;
    }
  },

  /**
   * Valida si hay suficiente stock usando RPC
   */
  async validarStock(productoId: number, cantidad: number): Promise<boolean> {
    try {
      const valido = await validarStockSuficiente(productoId, cantidad);
      return valido;
    } catch (error) {
      console.error('Error validando stock:', error);
      return false;
    }
  },

  /**
   * Registra movimiento en BD y RPC
   */
  async registrarMovimientoRPC(data: {
    tipo_movimiento: 'entrada' | 'salida' | 'ajuste';
    cantidad: number;
    referencia_tipo: string;
    referencia_id?: number;
    descripcion?: string;
    usuario_id: number;
  }) {
    try {
      // Registrar en BD
      const movimiento = await prisma.movimientos_inventario.create({
        data: {
          cantidad: data.cantidad,
          motivo: data.descripcion ?? 'Movimiento registrado',
          tipo_movimiento: data.tipo_movimiento as any,
          usuario_id: BigInt(data.usuario_id),
          referencia_tipo: data.referencia_tipo as ReferenciaMovimiento,
          referencia_id: data.referencia_id ? BigInt(data.referencia_id) : null,
        },
      });

      // Registrar en RPC
      await insertarMovimiento({
        tipo_movimiento: data.tipo_movimiento,
        referencia_tipo: data.referencia_tipo,
        referencia_id: data.referencia_id,
        cantidad: data.cantidad,
        descripcion: data.descripcion,
        usuario_id: data.usuario_id,
      });

      return serializeBigInt(movimiento);
    } catch (error) {
      console.error('Error registrando movimiento:', error);
      throw error;
    }
  },
};
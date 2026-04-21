import { prisma }          from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import type { ReferenciaMovimiento } from '@prisma/client';

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

    // Prisma no permite comparar dos columnas → filtramos en JS
    const resultado = params?.bajo_stock
      ? insumos.filter(i => i.stock_actual <= i.stock_minimo)
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
        tipo:              data.tipo              as any,
        categoria_insumo:  (data.categoria_insumo  as any) ?? 'otro',
        unidad_medida:     (data.unidad_medida      as any) ?? 'unidades',
        stock_actual:      data.stock_actual       ?? 0,
        stock_minimo:      data.stock_minimo       ?? 10,
        stock_maximo:      data.stock_maximo       ?? null,
        precio_unitario:   data.precio_unitario    ?? null,
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
    const insumo = await prisma.insumo.update({
      where: { id: BigInt(id) },
      data:  { ...data as any, updated_at: new Date() },
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

      const [actualizado] = await Promise.all([
        tx.insumo.update({
          where: { id: BigInt(id) },
          data: {
            stock_actual: nuevoStock,
            updated_at:   new Date(),
            ...(input.precio_unitario !== undefined && { precio_unitario: input.precio_unitario }),
          },
        }),
        tx.movimientos_inventario.create({
          data: {
            insumo_id:       BigInt(id),
            cantidad:        Math.abs(nuevoStock - stockAnterior),
            motivo:          input.motivo          ?? 'Ajuste de stock manual',
            tipo_movimiento: tipoMovimiento        as any,
            usuario_id:      input.usuario_id      ? BigInt(input.usuario_id) : null,
            costo_unitario:  input.costo_unitario ?? (insumo.precio_unitario ? insumo.precio_unitario.toNumber() : null),
            stock_anterior:  stockAnterior,
            stock_posterior: nuevoStock,
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
};
import { prisma }          from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';

export const MaterialesService = {

  async listar(params?: {
    tipo?:      string;
    busqueda?:  string;
    stockBajo?: boolean;
  }) {
    const where: any = {};

    if (params?.tipo && params.tipo !== 'todos') {
      where.tipo = params.tipo;
    }
    if (params?.busqueda) {
      where.OR = [
        { nombre:      { contains: params.busqueda, mode: 'insensitive' } },
        { composicion: { contains: params.busqueda, mode: 'insensitive' } },
        { color:       { contains: params.busqueda, mode: 'insensitive' } },
      ];
    }
    if (params?.stockBajo) {
      where.stock_actual = { lte: prisma.material.fields.stock_minimo };
    }

    const materiales = await prisma.material.findMany({
      where,
      include: {
        proveedores: { select: { id: true, razon_social: true } },
      },
      orderBy: { nombre: 'asc' },
    });

    return serializeBigInt(materiales);
  },

  async obtenerPorId(id: string) {
    const material = await prisma.material.findUnique({
      where:   { id: BigInt(id) },
      include: { proveedores: true },
    });
    return material ? serializeBigInt(material) : null;
  },

  async crear(data: {
    nombre:           string;
    descripcion?:     string;
    tipo?:            string;
    composicion?:     string;
    gramaje?:         number;
    ancho_total?:     number;
    ancho_util?:      number;
    color?:           string;
    codigo_color?:    string;
    unidad_medida?:   string;
    stock_actual?:    number;
    stock_minimo?:    number;
    precio_unitario?: number;
    proveedor_id?:    string | number;
    ubicacion_almacen?: string;
    alerta_bajo_stock?: boolean;
  }) {
    const material = await prisma.material.create({
      data: {
        nombre:            data.nombre,
        descripcion:       data.descripcion       ?? null,
        tipo:              (data.tipo              as any) ?? 'plano',
        composicion:       data.composicion        ?? null,
        gramaje:           data.gramaje            ?? null,
        ancho_total:       data.ancho_total        ?? null,
        ancho_util:        data.ancho_util         ?? null,
        color:             data.color              ?? null,
        codigo_color:      data.codigo_color       ?? null,
        unidad_medida:     (data.unidad_medida     as any) ?? 'metros',
        stock_actual:      data.stock_actual       ?? 0,
        stock_minimo:      data.stock_minimo       ?? 10,
        precio_unitario:   data.precio_unitario    ?? null,
        proveedor_id:      data.proveedor_id ? BigInt(data.proveedor_id) : null,
        ubicacion_almacen: data.ubicacion_almacen  ?? null,
        alerta_bajo_stock: data.alerta_bajo_stock  ?? true,
      },
    });
    return serializeBigInt(material);
  },

  async actualizar(id: string, data: Partial<{
    nombre:           string;
    descripcion:      string;
    tipo:             string;
    composicion:      string;
    gramaje:          number;
    ancho_total:      number;
    ancho_util:       number;
    color:            string;
    codigo_color:     string;
    unidad_medida:    string;
    stock_actual:     number;
    stock_minimo:     number;
    precio_unitario:  number;
    proveedor_id:     string | number;
    ubicacion_almacen: string;
    alerta_bajo_stock: boolean;
  }>) {
    const material = await prisma.material.update({
      where: { id: BigInt(id) },
      data: {
        ...data,
        proveedor_id: data.proveedor_id ? BigInt(data.proveedor_id) : undefined,
        updated_at:   new Date(),
      } as any,
    });
    return serializeBigInt(material);
  },

  async eliminar(id: string) {
    await prisma.material.delete({ where: { id: BigInt(id) } });
    return { success: true };
  },

  async ajustarStock(id: string, data: {
    operacion: 'sumar' | 'restar' | 'absoluto';
    cantidad:  number;
    motivo?:   string;
  }) {
    const material = await prisma.material.findUnique({
      where:  { id: BigInt(id) },
      select: { stock_actual: true },
    });
    if (!material) throw new Error('Material no encontrado');

    const stockActual = Number(material.stock_actual);
    let nuevoStock: number;

    if (data.operacion === 'sumar')    nuevoStock = stockActual + data.cantidad;
    else if (data.operacion === 'restar') nuevoStock = Math.max(0, stockActual - data.cantidad);
    else                               nuevoStock = data.cantidad;

    const actualizado = await prisma.material.update({
      where: { id: BigInt(id) },
      data:  { stock_actual: nuevoStock, updated_at: new Date() },
    });
    return serializeBigInt(actualizado);
  },
};
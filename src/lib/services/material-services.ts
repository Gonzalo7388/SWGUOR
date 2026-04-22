import { prisma }          from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';

export const MaterialesService = {

  async listar(params?: {
    tipo?:      string;
    busqueda?:  string;
    bajo_stock?: boolean;
    sort?:      'asc' | 'desc';
  }) {
    const where: any = {};
    if (params?.tipo)      where.tipo   = params.tipo;
    if (params?.busqueda)  where.nombre = { contains: params.busqueda, mode: 'insensitive' };

    const materiales = await prisma.material.findMany({
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
      ? materiales.filter(m => m.stock_actual <= m.stock_minimo)
      : materiales;

    return serializeBigInt(resultado);
  },

  async obtenerPorId(id: string) {
    const material = await prisma.material.findUnique({
      where:   { id: BigInt(id) },
      include: { proveedores: { select: { id: true, razon_social: true } } },
    });
    return material ? serializeBigInt(material) : null;
  },

  async crear(data: {
    nombre:             string;
    tipo?:              string;
    descripcion?:       string;
    composicion?:       string;
    gramaje?:           number;
    ancho_total?:       number;
    ancho_util?:        number;
    color?:             string;
    codigo_color?:      string;
    unidad_medida?:     string;
    stock_actual?:      number;
    stock_minimo?:      number;
    precio_unitario?:   number;
    proveedor_id?:      string;
    ubicacion_almacen?: string;
    alerta_bajo_stock?: boolean;
  }) {
    const material = await prisma.material.create({
      data: {
        nombre:            data.nombre,
        tipo:              (data.tipo             as any) ?? 'plano',
        descripcion:       data.descripcion       ?? null,
        composicion:       data.composicion       ?? null,
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
    nombre:             string;
    tipo:               string;
    descripcion:        string;
    composicion:        string;
    gramaje:            number;
    ancho_total:        number;
    ancho_util:         number;
    color:              string;
    codigo_color:       string;
    unidad_medida:      string;
    stock_minimo:       number;
    precio_unitario:    number;
    proveedor_id:       string;
    ubicacion_almacen:  string;
    alerta_bajo_stock:  boolean;
  }>) {
    const { proveedor_id, ...rest } = data as any;
    const material = await prisma.material.update({
      where: { id: BigInt(id) },
      data:  {
        ...rest,
        ...(proveedor_id !== undefined && {
          proveedor_id: proveedor_id ? BigInt(proveedor_id) : null,
        }),
        updated_at: new Date(),
      },
    });
    return serializeBigInt(material);
  },

  // Ajusta stock directamente (material no tiene tabla de movimientos propia)
  async ajustarStock(id: string, input: {
    operacion:        'sumar' | 'restar' | 'absoluto';
    cantidad:         number;
    precio_unitario?: number;
    motivo?:          string;
  }) {
    const material = await prisma.material.findUniqueOrThrow({
      where: { id: BigInt(id) },
    });

    const stockAnterior = Number(material.stock_actual);
    let nuevoStock: number;

    if (input.operacion === 'sumar')    nuevoStock = stockAnterior + input.cantidad;
    else if (input.operacion === 'restar') nuevoStock = stockAnterior - input.cantidad;
    else                                   nuevoStock = input.cantidad;

    if (nuevoStock < 0) {
      throw new Error(`Stock insuficiente. Actual: ${stockAnterior}`);
    }

    const actualizado = await prisma.material.update({
      where: { id: BigInt(id) },
      data:  {
        stock_actual: nuevoStock,
        updated_at:   new Date(),
        ...(input.precio_unitario !== undefined && {
          precio_unitario: input.precio_unitario,
        }),
      },
    });

    return serializeBigInt(actualizado);
  },

  async eliminar(id: string) {
    await prisma.material.delete({ where: { id: BigInt(id) } });
    return { success: true };
  },
};
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import type { ReferenciaMovimiento, TipoMovimiento } from '@prisma/client';
import { insertarMovimiento } from '@/lib/helpers/rpc-helpers';

export interface RegistrarParams {
  insumo_id?: string | number;
  material_id?: string | number;
  producto_id?: string | number;
  cantidad: number;
  tipo_movimiento: TipoMovimiento;
  referencia_tipo: ReferenciaMovimiento;
  referencia_id?: number;       // opcional — se pasa como referenciaId al RPC
  motivo: string;
  usuario_id?: string | number;
  almacen_id?: string | number;
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

// Lista completa del enum TipoMovimiento definido en el schema de Prisma / DB
const TODOS_LOS_TIPOS: TipoMovimiento[] = [
  'entrada',
  'salida',
  'ajuste',
  'consumo_orden_produccion',
  'consumo_orden_produccion_item',
  'produccion_entrada',
  'devolucion_consumo',
  'devolucion_a_proveedor',
  'recepcion_devolucion_proveedor',
  'incidencia_taller',
  'devolucion_a_cliente',
  'recepcion_devolucion_cliente',
];

export const MovimientosInventarioService = {

  async registrar(params: RegistrarParams) {
    const {
      insumo_id, material_id, producto_id,
      cantidad, tipo_movimiento, referencia_tipo,
      referencia_id, motivo, usuario_id, almacen_id,
    } = params;

    // Refleja el CHECK constraint chk_un_solo_recurso (= 1) de la DB
    const recursos = [insumo_id, material_id, producto_id].filter(Boolean).length;
    if (recursos === 0)
      throw new Error('Debe proporcionar exactamente un ID de insumo, material o producto');
    if (recursos > 1)
      throw new Error('Solo puede proporcionar un recurso a la vez: insumo, material o producto');

    // Refleja el CHECK constraint chk_cantidad_positiva (cantidad > 0) de la DB
    if (cantidad <= 0)
      throw new Error('La cantidad debe ser mayor a 0');

    // insertarMovimiento llama a fn_insertar_movimiento que hace el INSERT;
    // los triggers tr_procesar_movimiento_insumo y trg_actualizar_almacen_stock
    // se disparan automáticamente desde ese INSERT.
    await insertarMovimiento({
      tipoMovimiento: tipo_movimiento,    // TipoMovimiento completo — FIX error TS 2322
      referenciaType: referencia_tipo,
      referenciaId: referencia_id,      // opcional — FIX error TS 2345
      cantidad,
      motivo,
      productoId: producto_id ? Number(producto_id) : undefined,
      insumoId: insumo_id ? Number(insumo_id) : undefined,
      materialId: material_id ? Number(material_id) : undefined,
      usuarioId: usuario_id ? Number(usuario_id) : undefined,
      almacenId: almacen_id ? Number(almacen_id) : undefined,
    });

    return { success: true };
  },

  async listar(params?: ListarParams) {
    const where: Record<string, unknown> = {};

    if (params?.desde || params?.hasta)
      where.created_at = {
        ...(params?.desde && { gte: params.desde }),
        ...(params?.hasta && { lte: params.hasta }),
      };

    if (params?.tipo_movimiento) where.tipo_movimiento = params.tipo_movimiento;
    if (params?.referencia_tipo) where.referencia_tipo = params.referencia_tipo;
    if (params?.producto_id) where.producto_id = BigInt(params.producto_id);
    if (params?.material_id) where.material_id = BigInt(params.material_id);
    if (params?.insumo_id) where.insumo_id = BigInt(params.insumo_id);
    if (params?.usuario_id) where.usuario_id = BigInt(params.usuario_id);
    if (params?.almacen_id) where.almacen_id = BigInt(params.almacen_id);

    const movimientos = await prisma.movimientos_inventario.findMany({
      where,
      include: {
        insumo: { select: { id: true, nombre: true, unidad_medida: true } },
        materiales: { select: { id: true, nombre: true } },
        productos: { select: { id: true, nombre: true } },
        usuarios: { select: { id: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
      take: params?.limite ?? 100,
    });

    let resultado = serializeBigInt(movimientos);

    if (params?.busqueda) {
      const q = params.busqueda.toLowerCase();
      resultado = resultado.filter((mov: Record<string, unknown>) => {
        const item = (mov.insumo ?? mov.materiales ?? mov.productos) as Record<string, unknown> | null;
        const nombre = typeof item?.nombre === 'string' ? item.nombre : '';
        return (
          nombre.toLowerCase().includes(q) ||
          String(mov.motivo ?? '').toLowerCase().includes(q)
        );
      });
    }

    return resultado;
  },

  // Cubre todos los tipos del enum — antes solo contaba entrada/salida/ajuste
  async obtenerResumen(params?: {
    tipo_movimiento?: TipoMovimiento;
    desde?: Date;
    hasta?: Date;
  }) {
    const whereBase: Record<string, unknown> = {};

    if (params?.tipo_movimiento) whereBase.tipo_movimiento = params.tipo_movimiento;
    if (params?.desde || params?.hasta)
      whereBase.created_at = {
        ...(params?.desde && { gte: params.desde }),
        ...(params?.hasta && { lte: params.hasta }),
      };

    const totalMovimientos = await prisma.movimientos_inventario.count({ where: whereBase });

    const conteos = await Promise.all(
      TODOS_LOS_TIPOS.map(async tipo => {
        const count = await prisma.movimientos_inventario.count({
          where: { ...whereBase, tipo_movimiento: tipo },
        });
        return [tipo, count] as const;
      })
    );

    const porTipo = Object.fromEntries(conteos) as Record<TipoMovimiento, number>;

    return {
      totalMovimientos,
      // Alias de compatibilidad con código anterior
      totalEntradas: porTipo.entrada,
      totalSalidas: porTipo.salida,
      totalAjustes: porTipo.ajuste,
      // Desglose completo de los 12 tipos
      porTipo,
    };
  },
};
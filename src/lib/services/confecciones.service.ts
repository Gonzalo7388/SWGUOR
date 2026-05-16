import { prisma }          from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { EstadoConfeccion } from '@prisma/client';

export const ConfeccionesService = {

  async listar(params?: {
    estado?:    string;
    taller_id?: string;
    pedido_id?: string;
    search?:    string;
    page?:      number;
    limit?:     number;
    statusFilter?: string;
  }) {
    const { estado, taller_id, pedido_id, search, page = 1, limit = 10, statusFilter } = params || {};
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (estado    && estado    !== 'todos') where.estado    = estado;
    if (taller_id && taller_id !== 'todos') where.taller_id = BigInt(taller_id);
    if (pedido_id)                          where.pedido_id = BigInt(pedido_id);

    if (statusFilter === 'activas') {
      where.estado = { notIn: ['completada', 'cancelada'] };
    } else if (statusFilter === 'urgentes') {
      where.prioridad = 'urgente';
      where.estado = { not: 'completada' };
    } else if (statusFilter === 'completadas') {
      where.estado = 'completada';
    }

    if (search) {
      where.OR = [
        { prenda: { contains: search, mode: 'insensitive' } },
        { talleres: { nombre: { contains: search, mode: 'insensitive' } } }
      ];
      if (!isNaN(Number(search))) {
        where.OR.push({ id: BigInt(search) });
      }
    }

    const [total, confecciones] = await Promise.all([
      prisma.confecciones.count({ where }),
      prisma.confecciones.findMany({
        where,
        take: limit,
        skip,
        include: {
          talleres: { select: { id: true, nombre: true } },
          pedidos:  { select: { id: true, estado: true } },
        },
        orderBy: { created_at: 'desc' },
      })
    ]);

    return {
      data: serializeBigInt(confecciones),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async obtenerPorId(id: string) {
    const confeccion = await prisma.confecciones.findUnique({
      where: { id: BigInt(id) },
      include: {
        talleres:  { select: { id: true, nombre: true, contacto: true, email: true, telefono: true, especialidad: true } },
        pedidos:   { select: { id: true, estado: true, total_unidades: true,
          clientes: { select: { id: true, razon_social: true, nombre_comercial: true } } } },
        seguimiento_confeccion: { orderBy: { created_at: 'desc' } },
      },
    });
    return confeccion ? serializeBigInt(confeccion) : null;
  },

  async actualizarEstado(id: string, estado: string, usuario_id?: string) {
    return prisma.$transaction(async (tx) => {
      const extra: any = {};
      if (estado === 'completada') extra.fecha_fin   = new Date();
      if (estado === 'en_proceso')   extra.fecha_inicio = new Date();

      const confeccion = await tx.confecciones.update({
        where: { id: BigInt(id) },
        data:  { estado: estado, ...extra, updated_at: new Date() },
      });

      await tx.seguimiento_confeccion.create({
        data: {
          confeccion_id:  BigInt(id),
          estado_nuevo:   estado as EstadoConfeccion,
          responsable_id: usuario_id ? BigInt(usuario_id) : null,
        },
      });

      return serializeBigInt(confeccion);
    });
  },

  async registrarSeguimiento(data: {
    confeccion_id:   string;
    estado_anterior?: string;
    estado_nuevo:    string;
    notas?:          string;
    usuario_id?:     string;
  }) {
    return prisma.$transaction(async (tx) => {
      const seg = await tx.seguimiento_confeccion.create({
        data: {
          confeccion_id:   BigInt(data.confeccion_id),
          estado_anterior: data.estado_anterior as any ?? null,
          estado_nuevo:    data.estado_nuevo    as any,
          notas:           data.notas           ?? null,
          responsable_id:  data.usuario_id ? BigInt(data.usuario_id) : null,
        },
      });

      await tx.confecciones.update({
        where: { id: BigInt(data.confeccion_id) },
        data:  { estado: data.estado_nuevo as any, updated_at: new Date() },
      });

      return serializeBigInt(seg);
    });
  },
};
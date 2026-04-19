// src/lib/services/confecciones.service.ts
import { prisma }          from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';

export const ConfeccionesService = {

  async listar(params?: {
    estado?:    string;
    taller_id?: string;
    pedido_id?: string;
  }) {
    const where: any = {};
    if (params?.estado    && params.estado    !== 'todos') where.estado    = params.estado;
    if (params?.taller_id && params.taller_id !== 'todos') where.taller_id = BigInt(params.taller_id);
    if (params?.pedido_id)                                  where.pedido_id = BigInt(params.pedido_id);

    const confecciones = await prisma.confecciones.findMany({
      where,
      include: {
        taller: { select: { id: true, nombre: true } },
        pedido:  { select: { id: true, estado: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    return serializeBigInt(confecciones);
  },

  async obtenerPorId(id: string) {
    const confeccion = await prisma.confecciones.findUnique({
      where: { id: BigInt(id) },
      include: {
        taller:  { select: { id: true, nombre: true, contacto: true, email: true, telefono: true, especialidad: true } },
        pedido:   { select: { id: true, estado: true, total_unidades: true,
          clientes: { select: { id: true, razon_social: true, nombre_comercial: true } } } },
        seguimiento_confeccion: { orderBy: { created_at: 'desc' } },
      },
    });
    return confeccion ? serializeBigInt(confeccion) : null;
  },

  async actualizarEstado(id: string, estado: string, usuario_id?: string) {
    return prisma.$transaction(async (tx) => {
      const extra: any = {};
      if (estado === 'completado') extra.fecha_fin   = new Date();
      if (estado === 'en_corte')   extra.fecha_inicio = new Date();

      const confeccion = await tx.confecciones.update({
        where: { id: BigInt(id) },
        data:  { estado: estado as any, ...extra, updated_at: new Date() },
      });

      await tx.seguimiento_confeccion.create({
        data: {
          confeccion_id:  BigInt(id),
          estado_nuevo:   estado as any,
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
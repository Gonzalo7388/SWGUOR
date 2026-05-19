// lib/services/incidencias-taller.service.ts
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { TipoIncidencia, SeveridadIncidencia } from '@prisma/client';

export const IncidenciasTallerService = {

  async listar(params?: {
    severidad?: string;
    resuelto?: boolean;
    confeccion_id?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { severidad, resuelto, confeccion_id, search, page = 1, limit = 10 } = params || {};
    const skip = (page - 1) * limit;
    const where: any = {};

    if (severidad && severidad !== 'todas') where.severidad = severidad;
    if (resuelto !== undefined) where.resuelto = resuelto;
    if (confeccion_id) where.confeccion_id = BigInt(confeccion_id);

    if (search) {
      where.OR = [
        { descripcion: { contains: search, mode: 'insensitive' } },
        { solucion: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, incidencias] = await Promise.all([
      prisma.incidencias_taller.count({ where }),
      prisma.incidencias_taller.findMany({
        where,
        take: limit,
        skip,
        include: {
          confecciones: {
            select: {
              id: true, prenda: true,
              talleres: { select: { id: true, nombre: true } },
            },
          },
          // Quién reportó
          usuario_reportador: { select: { id: true, email: true } },
          // A quién se asignó
          usuario_asignado: { select: { id: true, email: true } },
        },
        orderBy: { fecha_reporte: 'desc' },
      }),
    ]);

    return {
      data: serializeBigInt(incidencias),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async obtenerPorId(id: string) {
    const incidencia = await prisma.incidencias_taller.findUnique({
      where: { id: BigInt(id) },
      include: {
        confecciones: {
          include: { talleres: { select: { id: true, nombre: true } } },
        },
        usuario_reportador: { select: { id: true, email: true } },
        usuario_asignado: { select: { id: true, email: true } },
      },
    });
    return incidencia ? serializeBigInt(incidencia) : null;
  },

  async crear(data: {
    confeccion_id: string;
    tipo: TipoIncidencia;
    severidad: SeveridadIncidencia;
    descripcion: string;
    reportado_por?: string;
    asignado_a?: string;
    impacto_horas?: number;
    foto_url?: string;
  }) {
    // Obtener pedido_id desde la confección → orden_produccion → pedido
    const confeccion = await prisma.confecciones.findUnique({
      where: { id: BigInt(data.confeccion_id) },
      select: {
        ordenes_produccion: {
          select: { pedido_id: true },
        },
      },
    });

    const pedido_id = confeccion?.ordenes_produccion?.pedido_id;
    if (!pedido_id) throw new Error('No se encontró el pedido asociado a esta confección');

    const incidencia = await prisma.incidencias_taller.create({
      data: {
        confeccion_id: BigInt(data.confeccion_id),
        pedido_id,
        tipo: data.tipo,
        severidad: data.severidad,
        descripcion: data.descripcion,
        reportado_por: data.reportado_por ? BigInt(data.reportado_por) : null,
        asignado_a: data.asignado_a ? BigInt(data.asignado_a) : null,
        impacto_horas: data.impacto_horas ?? null,
        foto_url: data.foto_url ?? null,
        fecha_reporte: new Date(),
        resuelto: false,
      },
    });
    return serializeBigInt(incidencia);
  },

  // Solo el representante puede resolver — registra solución y cierra
  async resolver(id: string, data: {
    solucion: string;
    impacto_horas?: number;
    resuelto_por?: string;
  }) {
    const incidencia = await prisma.incidencias_taller.update({
      where: { id: BigInt(id) },
      data: {
        resuelto: true,
        solucion: data.solucion,
        fecha_resolucion: new Date(),
        ...(data.impacto_horas !== undefined && { impacto_horas: data.impacto_horas }),
        ...(data.resuelto_por !== undefined && { asignado_a: BigInt(data.resuelto_por) }),
        updated_at: new Date(),
      },
    });
    return serializeBigInt(incidencia);
  },

  async asignar(id: string, asignado_a: string) {
    const incidencia = await prisma.incidencias_taller.update({
      where: { id: BigInt(id) },
      data: { asignado_a: BigInt(asignado_a), updated_at: new Date() },
    });
    return serializeBigInt(incidencia);
  },
};
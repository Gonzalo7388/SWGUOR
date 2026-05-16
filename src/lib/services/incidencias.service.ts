import { prisma }                                    from '@/lib/prisma';
import { TipoIncidencia, SeveridadIncidencia, Prisma } from '@prisma/client';

// Tipo inferido directamente desde Prisma sin ningún cast
type IncidenciaRow = Prisma.incidenciasGetPayload<Record<string, never>>;

// ── Tipos de entrada ──────────────────────────────────────────────────────────

interface CrearIncidenciaInput {
  pedido_id:     bigint | number;
  tipo:          TipoIncidencia;
  severidad:     SeveridadIncidencia;
  descripcion:   string;
  confeccion_id?: bigint | number | null;
  reportado_por?: bigint | number | null;
  asignado_a?:    bigint | number | null;
  fecha_reporte?: Date | string;
  foto_url?:      string | null;
}

interface FiltrosIncidencia {
  tipo?:      TipoIncidencia;
  severidad?: SeveridadIncidencia;
  resuelto?:  boolean;
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const incidenciasService = {

  crear: (input: CrearIncidenciaInput): Promise<IncidenciaRow> => {
    return prisma.incidencias.create({
      data: {
        pedido_id:     BigInt(input.pedido_id),
        tipo:          input.tipo,
        severidad:     input.severidad,
        descripcion:   input.descripcion,
        confeccion_id: input.confeccion_id != null ? BigInt(input.confeccion_id) : null,
        reportado_por: input.reportado_por != null ? BigInt(input.reportado_por) : null,
        asignado_a:    input.asignado_a    != null ? BigInt(input.asignado_a)    : null,
        fecha_reporte: input.fecha_reporte != null ? new Date(input.fecha_reporte) : new Date(),
        foto_url:      input.foto_url      ?? null,
      },
    });
  },

  obtenerTodas: (filtros?: FiltrosIncidencia): Promise<IncidenciaRow[]> => {
    return prisma.incidencias.findMany({
      where: {
        ...(filtros?.tipo      != null && { tipo:      filtros.tipo }),
        ...(filtros?.severidad != null && { severidad: filtros.severidad }),
        ...(filtros?.resuelto  != null && { resuelto:  filtros.resuelto }),
      },
      orderBy: { fecha_reporte: 'desc' },
    });
  },

  obtenerPorId: (id: bigint | number): Promise<IncidenciaRow | null> => {
    return prisma.incidencias.findUnique({
      where: { id: BigInt(id) },
    });
  },

  resolver: (
    id:           bigint | number,
    solucion:     string,
    impactoHoras?: number,
  ): Promise<IncidenciaRow> => {
    return prisma.incidencias.update({
      where: { id: BigInt(id) },
      data: {
        resuelto:         true,
        solucion,
        fecha_resolucion: new Date(),
        ...(impactoHoras != null && { impacto_horas: impactoHoras }),
      },
    });
  },

  asignar: (
    id:        bigint | number,
    asignadoA: bigint | number,
  ): Promise<IncidenciaRow> => {
    return prisma.incidencias.update({
      where: { id: BigInt(id) },
      data:  { asignado_a: BigInt(asignadoA) },
    });
  },

  obtenerAbiertas: (): Promise<IncidenciaRow[]> => {
    return prisma.incidencias.findMany({
      where:   { resuelto: false },
      orderBy: { fecha_reporte: 'desc' },
    });
  },

  // severidad alta o critica sin resolver
  obtenerUrgentes: (): Promise<IncidenciaRow[]> => {
    return prisma.incidencias.findMany({
      where: {
        severidad: { in: [SeveridadIncidencia.alta, SeveridadIncidencia.critica] },
        resuelto:  false,
      },
      orderBy: { fecha_reporte: 'desc' },
    });
  },
};
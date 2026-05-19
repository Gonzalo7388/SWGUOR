import { prisma }                                          from '@/lib/prisma';
import { TipoGuiaRemision, EstadoGuiaRemision, Prisma }   from '@prisma/client';

// Tipo inferido directamente desde Prisma sin ningún cast
type GuiaRemisionRow = Prisma.guias_remisionGetPayload<Record<string, never>>;

// ── Tipos de entrada ──────────────────────────────────────────────────────────

interface CrearGuiaRemisionInput {
  numero:            string;
  tipo:              TipoGuiaRemision;
  origen_tipo:       string;
  origen_direccion:  string;
  destino_tipo:      string;
  destino_direccion: string;
  fecha_traslado:    Date | string;
  pedido_id?:           bigint | number | null;
  orden_produccion_id?: bigint | number | null;
  origen_id?:           bigint | number | null;
  destino_id?:          bigint | number | null;
  transportista?:       string | null;
  ruc_transportista?:   string | null;
  placa_vehiculo?:      string | null;
  motivo_traslado?:     string | null;
  observaciones?:       string | null;
  emitido_por?:         bigint | number | null;
}

interface FiltrosGuiaRemision {
  tipo?:   TipoGuiaRemision;
  estado?: EstadoGuiaRemision;
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const guiasRemisionService = {

  crear: (input: CrearGuiaRemisionInput): Promise<GuiaRemisionRow> => {
    return prisma.guias_remision.create({
      data: {
        numero:              input.numero,
        tipo:                input.tipo,
        origen_tipo:         input.origen_tipo,
        origen_direccion:    input.origen_direccion,
        destino_tipo:        input.destino_tipo,
        destino_direccion:   input.destino_direccion,
        fecha_traslado:      new Date(input.fecha_traslado),
        pedido_id:           input.pedido_id           != null ? BigInt(input.pedido_id)           : null,
        orden_produccion_id: input.orden_produccion_id != null ? BigInt(input.orden_produccion_id) : null,
        origen_id:           input.origen_id           != null ? BigInt(input.origen_id)           : null,
        destino_id:          input.destino_id          != null ? BigInt(input.destino_id)          : null,
        transportista:       input.transportista       ?? null,
        ruc_transportista:   input.ruc_transportista   ?? null,
        placa_vehiculo:      input.placa_vehiculo      ?? null,
        motivo_traslado:     input.motivo_traslado     ?? null,
        observaciones:       input.observaciones       ?? null,
        emitido_por:         input.emitido_por         != null ? BigInt(input.emitido_por)         : null,
      },
    });
  },

  obtenerTodas: (filtros?: FiltrosGuiaRemision): Promise<GuiaRemisionRow[]> => {
    return prisma.guias_remision.findMany({
      where: {
        ...(filtros?.tipo   != null && { tipo:   filtros.tipo }),
        ...(filtros?.estado != null && { estado: filtros.estado }),
      },
      orderBy: { fecha_emision: 'desc' },
    });
  },

  obtenerPorId: (id: bigint | number): Promise<GuiaRemisionRow | null> => {
    return prisma.guias_remision.findUnique({
      where: { id: BigInt(id) },
    });
  },

  // Cambia estado a "entregada" y registra fecha_entrega
  entregar: (
    id:                   bigint | number,
    observacionesEntrega?: string,
  ): Promise<GuiaRemisionRow> => {
    return prisma.guias_remision.update({
      where: { id: BigInt(id) },
      data: {
        estado:        EstadoGuiaRemision.entregada,
        fecha_entrega: new Date(),
        ...(observacionesEntrega != null && { observaciones: observacionesEntrega }),
        updated_at:    new Date(),
      },
    });
  },

  // Cambia estado a "en_transito"
  despachar: (id: bigint | number): Promise<GuiaRemisionRow> => {
    return prisma.guias_remision.update({
      where: { id: BigInt(id) },
      data:  { estado: EstadoGuiaRemision.en_transito, updated_at: new Date() },
    });
  },

  obtenerEnTransito: (): Promise<GuiaRemisionRow[]> => {
    return prisma.guias_remision.findMany({
      where:   { estado: EstadoGuiaRemision.en_transito },
      orderBy: { fecha_traslado: 'asc' },
    });
  },

  obtenerPendientes: (): Promise<GuiaRemisionRow[]> => {
    return prisma.guias_remision.findMany({
      where:   { estado: EstadoGuiaRemision.borrador },
      orderBy: { fecha_traslado: 'asc' },
    });
  },
};
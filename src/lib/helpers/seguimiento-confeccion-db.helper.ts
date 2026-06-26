import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { EtapaConfeccionDb } from '@/lib/constants/confecciones-etapas';
import { ETAPA_CONFECCION_INICIAL } from '@/lib/constants/confecciones-etapas';

type Tx = Prisma.TransactionClient;

export interface SeguimientoConfeccionDbRow {
  id: string;
  confeccion_id: string | null;
  etapa_anterior: EtapaConfeccionDb | null;
  etapa_nueva: EtapaConfeccionDb | null;
  /** Alias legacy para UI/API que aún nombran estado_* */
  estado_anterior: EtapaConfeccionDb | null;
  estado_nuevo: EtapaConfeccionDb | null;
  notas: string | null;
  responsable_id: string | null;
  created_at: string | null;
}

type RawSeguimiento = {
  id: bigint;
  confeccion_id: bigint | null;
  etapa_anterior: EtapaConfeccionDb | null;
  etapa_nueva: EtapaConfeccionDb | null;
  notas: string | null;
  responsable_id: bigint | null;
  created_at: Date | null;
};

function mapRow(row: RawSeguimiento): SeguimientoConfeccionDbRow {
  return {
    id: String(row.id),
    confeccion_id: row.confeccion_id != null ? String(row.confeccion_id) : null,
    etapa_anterior: row.etapa_anterior,
    etapa_nueva: row.etapa_nueva,
    estado_anterior: row.etapa_anterior,
    estado_nuevo: row.etapa_nueva,
    notas: row.notas,
    responsable_id: row.responsable_id != null ? String(row.responsable_id) : null,
    created_at: row.created_at?.toISOString() ?? null,
  };
}

export async function obtenerEtapaConfeccion(
  tx: Tx,
  confeccionId: bigint,
): Promise<EtapaConfeccionDb> {
  const rows = await tx.$queryRaw<{ etapa: EtapaConfeccionDb | null }[]>`
    SELECT etapa FROM public.confecciones WHERE id = ${confeccionId}
  `;
  return rows[0]?.etapa ?? ETAPA_CONFECCION_INICIAL;
}

export async function crearSeguimientoConfeccion(
  tx: Tx,
  data: {
    confeccion_id: bigint;
    etapa_nueva: EtapaConfeccionDb;
    etapa_anterior?: EtapaConfeccionDb | null;
    notas?: string | null;
    responsable_id?: bigint | null;
  },
): Promise<bigint> {
  const rows = await tx.$queryRaw<{ id: bigint }[]>`
    INSERT INTO public.seguimiento_confeccion (
      confeccion_id, etapa_anterior, etapa_nueva, notas, responsable_id
    ) VALUES (
      ${data.confeccion_id},
      ${data.etapa_anterior ?? null}::"EtapaConfeccion",
      ${data.etapa_nueva}::"EtapaConfeccion",
      ${data.notas ?? null},
      ${data.responsable_id ?? null}
    )
    RETURNING id
  `;
  return rows[0].id;
}

/** Registra un hito inicial o de etapa tras crear la confección. */
export async function crearSeguimientoConfeccionInicial(
  tx: Tx,
  params: {
    confeccion_id: bigint;
    notas: string;
    responsable_id?: bigint | null;
    etapa_nueva?: EtapaConfeccionDb;
  },
): Promise<void> {
  await crearSeguimientoConfeccion(tx, {
    confeccion_id: params.confeccion_id,
    etapa_nueva: params.etapa_nueva ?? ETAPA_CONFECCION_INICIAL,
    notas: params.notas,
    responsable_id: params.responsable_id ?? null,
  });
}

/**
 * Cuando la UI aún cambia `confecciones.estado` (EstadoConfeccion), dejamos constancia
 * en seguimiento con la etapa actual y una nota que describe el cambio de estado.
 */
export async function crearSeguimientoConfeccionPorCambioEstado(
  tx: Tx,
  params: {
    confeccion_id: bigint;
    estado_anterior: string;
    estado_nuevo: string;
    notas?: string | null;
    responsable_id?: bigint | null;
  },
): Promise<void> {
  const etapa = await obtenerEtapaConfeccion(tx, params.confeccion_id);
  const notaEstado = `Estado: ${params.estado_anterior} → ${params.estado_nuevo}`;
  const notas = [notaEstado, params.notas?.trim()].filter(Boolean).join('. ');

  await crearSeguimientoConfeccion(tx, {
    confeccion_id: params.confeccion_id,
    etapa_anterior: etapa,
    etapa_nueva: etapa,
    notas,
    responsable_id: params.responsable_id ?? null,
  });
}

export async function listarSeguimientoConfeccion(
  confeccionId: bigint,
  tx: Tx = prisma,
): Promise<SeguimientoConfeccionDbRow[]> {
  const rows = await tx.$queryRaw<RawSeguimiento[]>`
    SELECT id, confeccion_id, etapa_anterior, etapa_nueva, notas, responsable_id, created_at
    FROM public.seguimiento_confeccion
    WHERE confeccion_id = ${confeccionId}
    ORDER BY created_at DESC
  `;
  return rows.map(mapRow);
}

export async function obtenerSeguimientoConfeccionPorId(
  id: bigint,
): Promise<SeguimientoConfeccionDbRow | null> {
  const rows = await prisma.$queryRaw<RawSeguimiento[]>`
    SELECT id, confeccion_id, etapa_anterior, etapa_nueva, notas, responsable_id, created_at
    FROM public.seguimiento_confeccion
    WHERE id = ${id}
    LIMIT 1
  `;
  const row = rows[0];
  return row ? mapRow(row) : null;
}

export async function actualizarNotasSeguimientoConfeccion(
  id: bigint,
  notas: string | null,
): Promise<SeguimientoConfeccionDbRow> {
  const rows = await prisma.$queryRaw<RawSeguimiento[]>`
    UPDATE public.seguimiento_confeccion
    SET notas = ${notas}
    WHERE id = ${id}
    RETURNING id, confeccion_id, etapa_anterior, etapa_nueva, notas, responsable_id, created_at
  `;
  const row = rows[0];
  if (!row) throw new Error('Registro de seguimiento no encontrado');
  return mapRow(row);
}

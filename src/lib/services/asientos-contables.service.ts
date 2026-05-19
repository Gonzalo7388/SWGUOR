import { prisma } from '@/lib/prisma';
import { TipoAsiento, CuentaContable, Prisma } from '@prisma/client';

type AsientoRow = Prisma.asientos_contablesGetPayload<Record<string, never>>;

// ── Tipos de entrada ──────────────────────────────────────────────────────────

interface CrearAsientoInput {
  tipo: TipoAsiento;
  monto: number;
  cuenta: CuentaContable;
  fecha?: Date | string;
  descripcion?: string | null;
  pedido_id?: bigint | number | null;
  pago_id?: string | null;
  usuario_id?: bigint | number | null;
}

interface FiltrosAsiento {
  tipo?: TipoAsiento;
  cuenta?: CuentaContable;
  pedido_id?: bigint | number;
  pago_id?: string;
  desde?: Date;
  hasta?: Date;
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const asientosContablesService = {

  listar: (filtros?: FiltrosAsiento): Promise<AsientoRow[]> => {
    return prisma.asientos_contables.findMany({
      where: {
        ...(filtros?.tipo != null && { tipo: filtros.tipo }),
        ...(filtros?.cuenta != null && { cuenta: filtros.cuenta }),
        ...(filtros?.pago_id != null && { pago_id: filtros.pago_id }),
        ...(filtros?.pedido_id != null && { pedido_id: filtros.pedido_id }),
        ...((filtros?.desde != null || filtros?.hasta != null) && {
          fecha: {
            ...(filtros.desde != null && { gte: filtros.desde }),
            ...(filtros.hasta != null && { lte: filtros.hasta }),
          },
        }),
      },
      orderBy: { fecha: 'desc' },
    });
  },

  obtenerPorId: (id: bigint | number): Promise<AsientoRow | null> => {
    return prisma.asientos_contables.findUnique({
      where: { id: BigInt(id) },
    });
  },

  crear: (input: CrearAsientoInput): Promise<AsientoRow> => {
    return prisma.asientos_contables.create({
      data: {
        tipo: input.tipo,
        monto: input.monto,
        cuenta: input.cuenta,
        fecha: input.fecha != null ? new Date(input.fecha) : new Date(),
        descripcion: input.descripcion ?? null,
        pago_id: input.pago_id ?? null,                                    // string | null
        pedido_id: input.pedido_id != null ? BigInt(input.pedido_id) : null,  // bigint | null
        usuario_id: input.usuario_id != null ? BigInt(input.usuario_id) : null,
      },
    });
  },

  actualizar: (
    id: bigint | number,
    input: Partial<CrearAsientoInput>,
  ): Promise<AsientoRow> => {
    // Tipado explícito para evitar el conflicto Without<Checked, Unchecked>
    const data: Prisma.asientos_contablesUncheckedUpdateInput = {
      ...(input.tipo != null && { tipo: input.tipo }),
      ...(input.monto != null && { monto: input.monto }),
      ...(input.cuenta != null && { cuenta: input.cuenta }),
      ...(input.fecha != null && { fecha: new Date(input.fecha) }),
      ...('descripcion' in input && { descripcion: input.descripcion ?? null }),
      ...('pago_id' in input && { pago_id: input.pago_id ?? null }),
      ...('pedido_id' in input && { pedido_id: input.pedido_id != null ? BigInt(input.pedido_id) : null }),
      ...('usuario_id' in input && { usuario_id: input.usuario_id != null ? BigInt(input.usuario_id) : null }),
    };

    return prisma.asientos_contables.update({
      where: { id: BigInt(id) },
      data,
    });
  },

  eliminar: async (id: bigint | number): Promise<{ success: boolean; message: string }> => {
    try {
      await prisma.asientos_contables.delete({ where: { id: BigInt(id) } });
      return { success: true, message: 'Registro eliminado correctamente' };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2025'
      ) {
        return { success: false, message: 'Registro no encontrado' };
      }
      throw error;
    }
  },

  obtenerPorPeriodo: (desde: Date, hasta: Date): Promise<AsientoRow[]> => {
    return prisma.asientos_contables.findMany({
      where: { fecha: { gte: desde, lte: hasta } },
      orderBy: { fecha: 'desc' },
    });
  },
};
import { prisma } from '@/lib/prisma';
import { tarifas_taller, Prisma, EspecialidadTaller } from '@prisma/client';

// Campos reales del modelo 'tarifas_taller':
//   id, taller_id, especialidad (EspecialidadTaller), precio_unitario,
//   moneda, vigente_desde, vigente_hasta, activo, notas, created_at, updated_at

interface FiltrosTarifas {
  taller_id?:    number | bigint;
  especialidad?: EspecialidadTaller;
  activo?:       boolean;
}

interface CrearTarifaInput {
  taller_id:      number | bigint;
  especialidad:   EspecialidadTaller;
  precio_unitario: Prisma.Decimal | number | string;
  moneda?:        string;
  vigente_desde?: Date;
  vigente_hasta?: Date;
  activo?:        boolean;
  notas?:         string;
}

type ActualizarTarifaInput = Partial<Omit<CrearTarifaInput, 'taller_id'>>;

export const tarifaTalleresService = {
  crear: async (datos: CrearTarifaInput): Promise<tarifas_taller> => {
    return prisma.tarifas_taller.create({
      data: {
        taller_id:       BigInt(datos.taller_id),
        especialidad:    datos.especialidad,
        precio_unitario: datos.precio_unitario,
        moneda:          datos.moneda        ?? 'PEN',
        vigente_desde:   datos.vigente_desde ?? new Date(),
        vigente_hasta:   datos.vigente_hasta ?? null,
        activo:          datos.activo        ?? true,
        notas:           datos.notas         ?? null,
      },
    });
  },

  obtenerTodas: async (filtros?: FiltrosTarifas): Promise<tarifas_taller[]> => {
    return prisma.tarifas_taller.findMany({
      where: {
        activo: filtros?.activo ?? true,
        ...(filtros?.taller_id    && { taller_id:    BigInt(filtros.taller_id) }),
        ...(filtros?.especialidad && { especialidad: filtros.especialidad }),
      },
      orderBy: { vigente_desde: 'desc' },
    });
  },

  obtenerPorId: async (id: bigint): Promise<tarifas_taller | null> => {
    return prisma.tarifas_taller.findUnique({ where: { id } });
  },

  actualizar: async (
    id: bigint,
    datos: ActualizarTarifaInput,
  ): Promise<tarifas_taller> => {
    return prisma.tarifas_taller.update({
      where: { id },
      data: {
        ...(datos.especialidad    !== undefined && { especialidad:    datos.especialidad }),
        ...(datos.precio_unitario !== undefined && { precio_unitario: datos.precio_unitario }),
        ...(datos.moneda          !== undefined && { moneda:          datos.moneda }),
        ...(datos.vigente_desde   !== undefined && { vigente_desde:   datos.vigente_desde }),
        ...(datos.vigente_hasta   !== undefined && { vigente_hasta:   datos.vigente_hasta }),
        ...(datos.activo          !== undefined && { activo:          datos.activo }),
        ...(datos.notas           !== undefined && { notas:           datos.notas }),
      },
    });
  },

  obtenerPorTaller: async (tallerId: bigint): Promise<tarifas_taller[]> => {
    return tarifaTalleresService.obtenerTodas({ taller_id: tallerId });
  },

  obtenerPorEspecialidad: async (
    especialidad: EspecialidadTaller,
  ): Promise<tarifas_taller[]> => {
    return tarifaTalleresService.obtenerTodas({ especialidad });
  },

  calcularCosto: async (
    tarifaId: bigint,
    cantidad: number,
  ): Promise<{ costo: number; tarifa: tarifas_taller }> => {
    const tarifa = await tarifaTalleresService.obtenerPorId(tarifaId);
    if (!tarifa) throw new Error('Tarifa no encontrada');

    return {
      costo: Number(tarifa.precio_unitario) * cantidad,
      tarifa,
    };
  },
};
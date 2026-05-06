import { prisma } from '@/lib/prisma';
import { CrearTarifaTaller, TarifaTaller, ActualizarTarifaTaller } from '@/lib/schemas/tarifaTalleresSchema';

export const tarifaTalleresService = {
  crear: async (datos: CrearTarifaTaller): Promise<TarifaTaller> => {
    return await prisma.tarifaTalleres.create({
      data: {
        tallerId: datos.tallerId,
        nombreServicio: datos.nombreServicio,
        descripcion: datos.descripcion,
        tipoServicio: datos.tipoServicio,
        precioUnitario: datos.precioUnitario,
        unidadMedida: datos.unidadMedida,
        moneda: datos.moneda,
        tiempoEstimado: datos.tiempoEstimado,
        unidadTiempo: datos.unidadTiempo,
        vigenciaDesde: datos.vigenciaDesde,
        vigenciaHasta: datos.vigenciaHasta,
        activo: datos.activo,
        observaciones: datos.observaciones,
      },
    }) as Promise<TarifaTaller>;
  },

  obtenerTodas: async (filtros?: any): Promise<TarifaTaller[]> => {
    const where: any = { activo: true };
    if (filtros?.tallerId) where.tallerId = filtros.tallerId;
    if (filtros?.tipoServicio) where.tipoServicio = filtros.tipoServicio;
    if (filtros?.activo !== undefined) where.activo = filtros.activo;

    return await prisma.tarifaTalleres.findMany({
      where,
      orderBy: { nombreServicio: 'asc' },
    }) as Promise<TarifaTaller[]>;
  },

  obtenerPorId: async (id: string): Promise<TarifaTaller | null> => {
    return await prisma.tarifaTalleres.findUnique({
      where: { id },
    }) as Promise<TarifaTaller | null>;
  },

  actualizar: async (id: string, datos: ActualizarTarifaTaller): Promise<TarifaTaller> => {
    return await prisma.tarifaTalleres.update({
      where: { id },
      data: datos,
    }) as Promise<TarifaTaller>;
  },

  obtenerPorTaller: async (tallerId: string): Promise<TarifaTaller[]> => {
    return await tarifaTalleresService.obtenerTodas({ tallerId });
  },

  obtenerPorTipo: async (tipoServicio: string): Promise<TarifaTaller[]> => {
    return await tarifaTalleresService.obtenerTodas({ tipoServicio });
  },

  calcularCosto: async (tarifaId: string, cantidad: number): Promise<{ costo: number; tarifa: TarifaTaller }> => {
    const tarifa = await tarifaTalleresService.obtenerPorId(tarifaId);
    if (!tarifa) throw new Error('Tarifa no encontrada');

    return {
      costo: (tarifa.precioUnitario as number) * cantidad,
      tarifa,
    };
  },
};

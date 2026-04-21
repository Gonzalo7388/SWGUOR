import { prisma }          from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';

export const FichasTecnicasDetalleService = {

  async obtenerPorFicha(ficha_id: string) {
    const detalles = await prisma.fichas_tecnicas_detalle.findMany({
      where: { ficha_id: BigInt(ficha_id) },
      include: {
        material: {
          select: {
            id: true, nombre: true, tipo: true,
            composicion: true, color: true,
            unidad_medida: true, precio_unitario: true,
          },
        },
        insumo: {
          select: {
            id: true, nombre: true, tipo: true,
            unidad_medida: true, precio_unitario: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
    return serializeBigInt(detalles);
  },

  async guardar(ficha_id: string, items: {
    material_id?:          string | number;
    insumo_id?:            string | number;
    cantidad_consumo:      number;
    porcentaje_desperdicio?: number;
    observaciones?:        string;
  }[]) {
    return prisma.$transaction(async (tx) => {
      // Reemplazar todos los detalles de la ficha
      await tx.fichas_tecnicas_detalle.deleteMany({
        where: { ficha_id: BigInt(ficha_id) },
      });

      if (items.length > 0) {
        await tx.fichas_tecnicas_detalle.createMany({
          data: items.map(item => ({
            ficha_id:              BigInt(ficha_id),
            material_id:           item.material_id ? BigInt(item.material_id) : null,
            insumo_id:             item.insumo_id   ? BigInt(item.insumo_id)   : null,
            cantidad_consumo:      item.cantidad_consumo,
            porcentaje_desperdicio: item.porcentaje_desperdicio ?? 0,
            observaciones:         item.observaciones ?? null,
          })),
        });
      }

      return serializeBigInt(
        await tx.fichas_tecnicas_detalle.findMany({
          where: { ficha_id: BigInt(ficha_id) },
          include: { material: true, insumo: true },
        })
      );
    });
  },

  async eliminarItem(id: string) {
    await prisma.fichas_tecnicas_detalle.delete({ where: { id: BigInt(id) } });
    return { success: true };
  },

  // Calcular costo estimado total de la ficha
  async calcularCosto(ficha_id: string) {
    const detalles = await prisma.fichas_tecnicas_detalle.findMany({
      where:   { ficha_id: BigInt(ficha_id) },
      include: {
        material: { select: { precio_unitario: true } },
        insumo:   { select: { precio_unitario: true } },
      },
    });

    const costo = detalles.reduce((total, d) => {
      const precio = Number(d.material?.precio_unitario ?? d.insumo?.precio_unitario ?? 0);
      const cantidad = Number(d.cantidad_consumo);
      const desperdicio = Number(d.porcentaje_desperdicio ?? 0) / 100;
      return total + precio * cantidad * (1 + desperdicio);
    }, 0);

    return Math.round(costo * 100) / 100;
  },
};
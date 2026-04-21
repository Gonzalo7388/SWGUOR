import { prisma }          from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { EstadoFicha } from '@prisma/client';

export const FichasTecnicasService = {

  async obtenerPorProducto(producto_id: string) {
    const ficha = await prisma.fichas_tecnicas.findFirst({
      where:   { id_producto: BigInt(producto_id) },
      include: { ficha_medidas: { orderBy: [{ talla: 'asc' }, { punto_medida: 'asc' }] } },
    });
    return ficha ? serializeBigInt(ficha) : null;
  },

  async crear(data: {
    producto_id:           string | number;
    version?:              string;
    descripcion_detallada?: string;
    sam_total?:            number;
    costo_estimado?:       number;
    ficha_url?:            string;
    imagen_geometral?:     string;
  }) {
    const existe = await prisma.fichas_tecnicas.findFirst({
      where: { id_producto: BigInt(data.producto_id) },
    });
    if (existe) throw new Error('Ya existe una ficha para este producto');

    return prisma.$transaction(async (tx) => {
      const ficha = await tx.fichas_tecnicas.create({
        data: {
          id_producto:           BigInt(data.producto_id),
          version:               data.version               ?? '1.0',
          descripcion_detallada: data.descripcion_detallada ?? null,
          sam_total:             data.sam_total             ?? null,
          costo_estimado:        data.costo_estimado        ?? null,
          ficha_url:             data.ficha_url             ?? null,
          imagen_geometral:      data.imagen_geometral      ?? null,
          estado:                'borrador',
        },
      });

      await tx.productos.update({
        where: { id: BigInt(data.producto_id) },
        data:  { fichas_tecnicas_id: ficha.id },
      });

      return serializeBigInt(ficha);
    });
  },

  async actualizar(id: string, data: Partial<{
    version:               string;
    descripcion_detallada: string;
    sam_total:             number;
    costo_estimado:        number;
    ficha_url:             string;
    imagen_geometral:      string;
    estado:                EstadoFicha;
  }>) {
    const ficha = await prisma.fichas_tecnicas.update({
      where: { id: BigInt(id) },
      data,
    });
    return serializeBigInt(ficha);
  },

  async guardarMedidas(ficha_id: string, medidas: {
    punto_medida: string;
    talla:        string;
    valor_cm?:    number;
    tolerancia?:  number;
  }[]) {
    return prisma.$transaction(async (tx) => {
      await tx.ficha_medidas.deleteMany({ where: { id_ficha: BigInt(ficha_id) } });

      if (medidas.length > 0) {
        await tx.ficha_medidas.createMany({
          data: medidas.map(m => ({
            id_ficha:    BigInt(ficha_id),
            punto_medida: m.punto_medida,
            talla:       m.talla,
            valor_cm:    m.valor_cm   ?? null,
            tolerancia:  m.tolerancia ?? null,
          })),
        });
      }

      return serializeBigInt(
        await tx.ficha_medidas.findMany({
          where:   { id_ficha: BigInt(ficha_id) },
          orderBy: [{ talla: 'asc' }, { punto_medida: 'asc' }],
        })
      );
    });
  },

  async eliminarMedida(id: string) {
    await prisma.ficha_medidas.delete({ where: { id: BigInt(id) } });
    return { success: true };
  },
};
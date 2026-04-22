import { prisma }          from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';

export const OrdenesProduccionService = {

  async listar(producto_id?: string) {
    const ordenes = await prisma.ordenes_produccion.findMany({
      where:   producto_id ? { producto_id: BigInt(producto_id) } : undefined,
      include: {
        productos: { select: { id: true, nombre: true, sku: true } },
        talleres:    { select: { id: true, nombre: true, email: true, contacto: true } },
        fichas_tecnicas:     { select: { id: true, version: true, estado: true } },
        seguimiento_produccion: { 
          where: { activo: true }, 
          take: 1, 
          orderBy: { created_at: 'desc' } 
        },
      },
      orderBy: { created_at: 'desc' },
    });
    return serializeBigInt(ordenes);
  },

  async crear(data: {
    producto_id:         string | number;
    taller_id:           string | number;
    ficha_id:            string | number;
    pedido_id:           string | number,
    cantidad_solicitada: number;
    fecha_entrega?:      string;
    notas?:              string;
    creado_por?:         string | number;
  }) {
    return prisma.$transaction(async (tx) => {
      const orden = await tx.ordenes_produccion.create({
        data: {
          producto_id:         BigInt(data.producto_id),
          taller_id:           BigInt(data.taller_id),
          ficha_id:            BigInt(data.ficha_id),
          pedido_id:           BigInt(data.pedido_id),
          cantidad_solicitada: data.cantidad_solicitada,
          fecha_entrega:       data.fecha_entrega ? new Date(data.fecha_entrega) : null,
          notas:               data.notas      ?? null,
          creado_por:          data.creado_por ? BigInt(data.creado_por) : null,
          estado:              'pendiente',
        },
        include: {
          productos: { select: { id: true, nombre: true, sku: true } },
          talleres:   { select: { id: true, nombre: true, email: true } },
          fichas_tecnicas:    { select: { id: true, version: true } },
        },
      });

      await tx.seguimiento_produccion.create({
        data: {
          orden_id:     orden.id,
          etapa:        'corte',
          observaciones: 'Orden creada — pendiente de inicio',
          activo:       true,
        },
      });

      await tx.productos.update({
        where: { id: BigInt(data.producto_id) },
        data:  { estado: 'en_produccion' },
      });

      return serializeBigInt(orden);
    });
  },

  async actualizar(id: string, data: {
    fecha_entrega?: string;
    notas?:         string;
  }) {
    const orden = await prisma.ordenes_produccion.update({
      where: { id: BigInt(id) },
      data: {
        ...(data.fecha_entrega !== undefined && { fecha_entrega: new Date(data.fecha_entrega) }),
        ...(data.notas         !== undefined && { notas:         data.notas }),
        updated_at: new Date(),
      },
    });
    return serializeBigInt(orden);
  },

  async registrarEtapa(data: {
    orden_id:       string;
    etapa:          string;
    observaciones?: string;
    usuario_id?:    string;
  }) {
    return prisma.$transaction(async (tx) => {
      await tx.seguimiento_produccion.updateMany({
        where: { orden_id: BigInt(data.orden_id), activo: true },
        data:  { activo: false, completado_en: new Date() },
      });

      const seg = await tx.seguimiento_produccion.create({
        data: {
          orden_id:      BigInt(data.orden_id),
          etapa:         data.etapa as any,
          observaciones: data.observaciones ?? null,
          usuario_id:   data.usuario_id ? BigInt(data.usuario_id) : null,
          activo:        true,
        },
      });

      if (data.etapa === 'almacen') {
        const orden = await tx.ordenes_produccion.findUnique({
          where: { id: BigInt(data.orden_id) },
          select: { producto_id: true, cantidad_solicitada: true }
        });

        if (orden) {
          await tx.productos.update({
            where: { id: orden.producto_id },
            data: {
              estado: 'activo',
              stock: { increment: orden.cantidad_solicitada }
            }
          });

          await tx.ordenes_produccion.update({
            where: { id: BigInt(data.orden_id) },
            data: { estado: 'completada' }
          });
        }
      }

      return serializeBigInt(seg);
    });
  },
};
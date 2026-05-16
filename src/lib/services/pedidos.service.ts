import { prisma }          from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { EstadoPedido, PrioridadPedido } from '@prisma/client';

export const PedidosService = {

  async listar() {
    const pedidos = await prisma.pedidos.findMany({
      include: {
        clientes:    { select: { id: true, razon_social: true, nombre_comercial: true } },
        pedido_items: { select: { id: true, cantidad: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    return serializeBigInt(pedidos);
  },

  async obtenerPorId(id: string) {
    const pedido = await prisma.pedidos.findUnique({
      where: { id: BigInt(id) },
      include: {
        clientes: {
          select: {
            id: true, ruc: true, razon_social: true,
            nombre_comercial: true, telefono: true, email: true,
          },
        },
        pedido_items: {
          include: {
            // fichas_tecnicas_id no existe en productosSelect:
            // la relación desde productos es fichas_tecnicas[] (lista)
            // Se selecciona la relación directa fichas_tecnicas en el include
            productos:         { select: { id: true, nombre: true, sku: true, imagen: true } },
            variantes_producto: { select: { id: true, color: true, talla: true, sku: true } },
          },
        },
        seguimiento_pedido: { orderBy: { created_at: 'desc' } },
        ordenes_produccion: {
          include: {
            talleres:       { select: { id: true, nombre: true, contacto: true, email: true } },
            fichas_tecnicas: { select: { id: true, version: true, estado: true } },
            seguimiento_produccion: {
              where:   { activo: true },
              take:    1,
              orderBy: { created_at: 'desc' },
            },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });
    return pedido ? serializeBigInt(pedido) : null;
  },

  async actualizar(id: string, data: {
    estado?:        EstadoPedido;
    prioridad?:     PrioridadPedido;
    notas_pedido?:  string;
    notas_cliente?: string;
  }) {
    const pedido = await prisma.pedidos.update({
      where: { id: BigInt(id) },
      data:  { ...data, updated_at: new Date() },
    });
    return serializeBigInt(pedido);
  },

  async registrarSeguimiento(data: {
    pedido_id:   string;
    status:      EstadoPedido;
    notas?:      string;
    creado_por?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const seg = await tx.seguimiento_pedido.create({
        data: {
          pedido_id:  BigInt(data.pedido_id),
          status:     data.status,
          notas:      data.notas      ?? null,
          creado_por: data.creado_por ?? null,
        },
      });

      await tx.pedidos.update({
        where: { id: BigInt(data.pedido_id) },
        data:  { estado: data.status, updated_at: new Date() },
      });

      return serializeBigInt(seg);
    });
  },
};
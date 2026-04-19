import { prisma }          from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import type { EstadoCliente, TipoCliente } from '@prisma/client';

export const ClientesService = {

  async listar(params?: {
    busqueda?:     string;
    tipo_cliente?: string;
    activo?:       string;
  }) {
    const where: any = {};

    if (params?.activo && params.activo !== 'todos') {
      where.activo = params.activo as EstadoCliente;
    }
    if (params?.tipo_cliente && params.tipo_cliente !== 'todos') {
      where.tipo_cliente = params.tipo_cliente as TipoCliente;
    }
    if (params?.busqueda) {
      where.OR = [
        { razon_social:    { contains: params.busqueda, mode: 'insensitive' } },
        { nombre_comercial: { contains: params.busqueda, mode: 'insensitive' } },
        { ruc:             { contains: params.busqueda } },
      ];
    }

    const clientes = await prisma.clientes.findMany({
      where,
      include: {
        direcciones_cliente: { select: { id: true, alias: true, direccion: true, es_principal: true } },
        _count: { select: { pedidos: true, cotizaciones: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return serializeBigInt(clientes);
  },

  async obtenerPorId(id: string) {
    const cliente = await prisma.clientes.findUnique({
      where: { id: BigInt(id) },
      include: {
        direcciones_cliente: true,
        pedidos: {
          select: { id: true, estado: true, total_estimado: true, created_at: true },
          orderBy: { created_at: 'desc' },
          take: 5,
        },
        _count: { select: { pedidos: true, cotizaciones: true } },
      },
    });
    return cliente ? serializeBigInt(cliente) : null;
  },

  async actualizar(id: string, data: Partial<{
    razon_social:    string;
    nombre_comercial: string;
    telefono:        string;
    email:           string;
    direccion_fiscal: string;
    tipo_cliente:    TipoCliente;
  }>) {
    const cliente = await prisma.clientes.update({
      where: { id: BigInt(id) },
      data:  { ...data, updated_at: new Date() },
    });
    return serializeBigInt(cliente);
  },

  // Borrado lógico — cambia activo a inactivo
  async desactivar(id: string) {
    const cliente = await prisma.clientes.update({
      where: { id: BigInt(id) },
      data:  { activo: 'inactivo' as EstadoCliente, updated_at: new Date() },
    });
    return serializeBigInt(cliente);
  },
};
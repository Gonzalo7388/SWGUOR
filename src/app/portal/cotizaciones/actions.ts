'use server';

import { prisma } from '@/lib/prisma';
import { serializePrismaPayload } from '@/lib/serializers';
import { EstadoCotizacion } from '@prisma/client';

/**
 * Get cotizaciones for portal client
 */
export async function getPortalCotizaciones(clienteId: number) {
  const rows = await prisma.cotizaciones.findMany({
    where: {
      cliente_id: BigInt(clienteId),
    },
    include: {
      cotizacion_items: {
        include: {
          productos: {
            select: {
              nombre: true,
              sku: true,
              imagen: true,
            },
          },
        },
      },
      clientes: true,
    },
    orderBy: { created_at: 'desc' },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mapped = rows.map((row) => {
    const validaHasta = new Date(row.valida_hasta);
    validaHasta.setHours(0, 0, 0, 0);
    
    const estaExpirada = row.estado === EstadoCotizacion.borrador && today > validaHasta;

    return {
      id: Number(row.id),
      numero: row.numero,
      cliente_id: Number(row.cliente_id),
      estado: estaExpirada ? 'expirada' : (row.estado ?? 'borrador'),
      subtotal: Number(row.subtotal ?? 0),
      igv: Number(row.igv ?? 0),
      total: Number(row.total ?? 0),
      valida_hasta: row.valida_hasta.toISOString(),
      created_at: row.created_at?.toISOString() ?? '',
      expirada: estaExpirada,
      aprobacion_automatica: row.aprobacion_automatica ?? false,
      items: row.cotizacion_items.map((item) => ({
        id: Number(item.id),
        producto_id: Number(item.producto_id),
        cantidad: item.cantidad,
        precio_unitario: Number(item.precio_unitario_snapshot),
        subtotal: Number(item.subtotal),
        producto: item.productos
          ? {
              nombre: item.productos.nombre,
              sku: item.productos.sku,
              imagen: item.productos.imagen,
            }
          : null,
      })),
    };
  });

  return serializePrismaPayload(mapped);
}

/**
 * Get single cotizacion detail for portal
 */
export async function getPortalCotizacionDetalle(cotizacionId: number, clienteId: number) {
  const row = await prisma.cotizaciones.findFirst({
    where: {
      id: BigInt(cotizacionId),
      cliente_id: BigInt(clienteId),
    },
    include: {
      cotizacion_items: {
        include: {
          productos: {
            select: {
              nombre: true,
              sku: true,
              imagen: true,
            },
          },
        },
      },
      clientes: true,
    },
  });

  if (!row) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const validaHasta = new Date(row.valida_hasta);
  validaHasta.setHours(0, 0, 0, 0);
  
  const estaExpirada = row.estado === EstadoCotizacion.borrador && today > validaHasta;

  return serializePrismaPayload({
    id: Number(row.id),
    numero: row.numero,
    cliente_id: Number(row.cliente_id),
    cliente: row.clientes?.razon_social,
    estado: estaExpirada ? 'expirada' : (row.estado ?? 'borrador'),
    subtotal: Number(row.subtotal ?? 0),
    igv: Number(row.igv ?? 0),
    total: Number(row.total ?? 0),
    valida_hasta: row.valida_hasta.toISOString(),
    created_at: row.created_at?.toISOString() ?? '',
    expirada: estaExpirada,
    aprobacion_automatica: row.aprobacion_automatica ?? false,
    notas_internas: row.notas_internas,
    items: row.cotizacion_items.map((item) => ({
      id: Number(item.id),
      producto_id: Number(item.producto_id),
      cantidad: item.cantidad,
      precio_unitario: Number(item.precio_unitario_snapshot),
      subtotal: Number(item.subtotal),
      producto: item.productos
        ? {
            nombre: item.productos.nombre,
            sku: item.productos.sku,
            imagen: item.productos.imagen,
          }
        : null,
    })),
  });
}

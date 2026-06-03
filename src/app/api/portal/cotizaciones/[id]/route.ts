export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/auth/server';

// ─────────────────────────────────────────────────────────────
// Helper: obtener cliente autenticado
// ─────────────────────────────────────────────────────────────
async function obtenerClienteSesion() {
  const auth = await requireServerAuth();
  if (!auth.success) {
    return { error: auth.error, status: auth.status };
  }

  const clienteDb = await prisma.clientes.findFirst({
    where: { usuario_id: auth.user.id },
    select: { id: true, razon_social: true, ruc: true, estado: true },
  });

  if (!clienteDb) {
    return { error: 'cliente_no_encontrado' as const, status: 404 };
  }

  return {
    usuario_id: auth.user.id,
    cliente_id: clienteDb.id,
    cliente: clienteDb,
  };
}

// ─────────────────────────────────────────────────────────────
// GET /api/portal/cotizaciones/[id]
// ─────────────────────────────────────────────────────────────
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const sesion = await obtenerClienteSesion();
    if ('error' in sesion) {
      return NextResponse.json(
        { success: false, error: sesion.error },
        { status: sesion.status },
      );
    }

    const cotizacion = await prisma.cotizaciones.findUnique({
      where: { id: BigInt(id) },
      include: {
        cotizacion_items: {
          include: {
            productos: {
              select: { id: true, nombre: true, sku: true, imagen: true },
            },
            variantes_producto: {
              select: { color: true, talla: true },
            },
          },
        },
        cliente: { // Se mantiene "cliente" según tu relación de Prisma
          select: {
            razon_social: true,
            ruc: true,
            telefono: true,
            email: true,
            direccion_fiscal: true,
          },
        },
        zona_envio: {
          select: {
            zona: true,
            costo: true,
          },
        },
      },
    });

    if (!cotizacion) {
      return NextResponse.json(
        { success: false, error: 'Cotización no encontrada' },
        { status: 404 },
      );
    }

    // ─────────────────────────────────────────────────────────
    // MAPEO CORRECTO PARA EL FRONTEND Y EL PDF
    // ─────────────────────────────────────────────────────────
    const cotizacionMapeada = {
      ...serializeBigInt(cotizacion),

      // 1. Forzamos "clientes" en plural para que page.tsx lo lea correctamente
      clientes: cotizacion.cliente ? {
        razon_social: cotizacion.cliente.razon_social,
        ruc: cotizacion.cliente.ruc,
        telefono: cotizacion.cliente.telefono,
        email: cotizacion.cliente.email,
        direccion_fiscal: cotizacion.cliente.direccion_fiscal,
      } : null,

      // 2. Extraemos el nombre de la zona de envío de la relación relacional
      zona_envio: cotizacion.zona_envio?.zona ?? 'Lima Metoditana / Local',

      // 3. Mapeamos los items
      cotizacion_items: cotizacion.cotizacion_items.map(item => ({
        ...serializeBigInt(item),
        descripcion: item.productos?.nombre ?? '—',
      })),
    };

    return NextResponse.json({ success: true, data: cotizacionMapeada });

  } catch (error: any) {
    console.error('[Portal] Error GET cotización por ID:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
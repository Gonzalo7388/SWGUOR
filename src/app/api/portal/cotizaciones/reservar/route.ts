export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────
// Helper: obtener el cliente_id del usuario autenticado
// ─────────────────────────────────────────────────────────────
async function obtenerClienteSesion() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'no_auth' as const };

  const usuarioDb = await prisma.usuarios.findFirst({
    where: { auth_id: user.id },
    select: { id: true },
  });

  if (!usuarioDb) return { error: 'usuario_no_encontrado' as const };

  const clienteDb = await prisma.clientes.findFirst({
    where: { usuario_id: usuarioDb.id },
    select: { id: true, razon_social: true },
  });

  if (!clienteDb) return { error: 'cliente_no_encontrado' as const };

  return {
    auth_user_id: user.id,
    usuario_id: usuarioDb.id,
    cliente_id: clienteDb.id,
    cliente: clienteDb,
  };
}

/**
 * POST /api/portal/cotizaciones/reservar
 *
 * Reserva stock temporal de variantes_producto vinculada a una cotización.
 * Crea registros en `reservas_stock` con expiración de 30 minutos.
 *
 * Body esperado:
 * {
 *   cotizacion_id: string | bigint,
 *   items: [
 *     { variante_id: string | bigint, cantidad: number }
 *   ]
 * }
 *
 * Reglas:
 *  - Solo el dueño de la cotización puede reservar su stock.
 *  - Se valida que haya stock suficiente en cada variante.
 *  - Las reservas expiran en 30 minutos (intervalo configurable).
 */
export async function POST(req: Request) {
  try {
    const sesion = await obtenerClienteSesion();
    if ('error' in sesion) {
      const status = sesion.error === 'no_auth' ? 401 : 404;
      return NextResponse.json(
        { success: false, error: sesion.error },
        { status }
      );
    }

    const body = await req.json();
    const { cotizacion_id, items, duracion_minutos } = body;

    if (!cotizacion_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Se requieren cotizacion_id e items' },
        { status: 400 }
      );
    }

    const expiraEn = duracion_minutos ?? 30;

    // ── 1. Validar que la cotización pertenece al cliente de la sesión ──
    const cotizacion = await prisma.cotizaciones.findUnique({
      where: { id: BigInt(cotizacion_id) },
      include: {
        cotizacion_items: true,
      },
    });

    if (!cotizacion) {
      return NextResponse.json(
        { success: false, error: 'cotizacion_no_encontrada' },
        { status: 404 }
      );
    }

    if (cotizacion.cliente_id !== sesion.cliente_id) {
      return NextResponse.json(
        { success: false, error: 'no_autorizado' },
        { status: 403 }
      );
    }

    // ── 2. Validar stock suficiente para cada item ──
    const faltantes: { variante_id: string; solicitado: number; disponible: number }[] = [];

    for (const item of items) {
      if (!item.variante_id || !item.cantidad) continue;

      const variante = await prisma.variantes_producto.findUnique({
        where: { id: BigInt(item.variante_id) },
        select: { id: true, stock_adicional: true, producto_id: true },
      });

      if (!variante) {
        faltantes.push({
          variante_id: item.variante_id,
          solicitado: item.cantidad,
          disponible: 0,
        });
        continue;
      }

      // Calcular stock ya reservado (reservas activas no expiradas)
      const reservasActivas = await prisma.reservas_stock.findMany({
        where: {
          variante_id: variante.id,
          estado: 'activa',
          expira_en: { gt: new Date() },
        },
        select: { cantidad: true },
      });

      const stockReservado = reservasActivas.reduce(
        (sum, r) => sum + r.cantidad,
        0
      );

      const stockDisponible = variante.stock_adicional - stockReservado;

      if (item.cantidad > stockDisponible) {
        faltantes.push({
          variante_id: item.variante_id,
          solicitado: item.cantidad,
          disponible: stockDisponible,
        });
      }
    }

    if (faltantes.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'stock_insuficiente',
          mensaje: 'No hay stock suficiente para uno o más items',
          faltantes: serializeBigInt(faltantes),
        },
        { status: 409 }
      );
    }

    // ── 3. Crear reservas en transacción ──
    const reservas = await prisma.$transaction(async (tx) => {
      const creadas = [];

      for (const item of items) {
        if (!item.variante_id || !item.cantidad) continue;

        const reserva = await tx.reservas_stock.create({
          data: {
            variante_id: BigInt(item.variante_id),
            cotizacion_id: BigInt(cotizacion_id),
            cantidad: item.cantidad,
            expira_en: new Date(Date.now() + expiraEn * 60 * 1000),
            estado: 'activa',
          },
        });

        creadas.push(reserva);
      }

      return creadas;
    });

    return NextResponse.json(
      {
        success: true,
        mensaje: `Stock reservado por ${expiraEn} minutos`,
        reservas: serializeBigInt(reservas),
        expira_en: reservas[0]?.expira_en?.toISOString() ?? null,
        cliente: sesion.cliente.razon_social,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Portal] Error en reservar stock:', error);
    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: 'Variante o cotización no encontrada' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/portal/cotizaciones/reservar?id=<reserva_id>
 * Cancela una reserva de stock activa.
 */
export async function DELETE(req: Request) {
  try {
    const sesion = await obtenerClienteSesion();
    if ('error' in sesion) {
      const status = sesion.error === 'no_auth' ? 401 : 404;
      return NextResponse.json(
        { success: false, error: sesion.error },
        { status }
      );
    }

    const { searchParams } = new URL(req.url);
    const reservaId = searchParams.get('id');

    if (!reservaId) {
      return NextResponse.json(
        { success: false, error: 'Se requiere el ID de la reserva' },
        { status: 400 }
      );
    }

    // Validar que la reserva pertenezca al cliente
    const reserva = await prisma.reservas_stock.findUnique({
      where: { id: BigInt(reservaId) },
      include: {
        variantes_producto: {
          select: {
            producto_id: true,
            productos: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!reserva) {
      return NextResponse.json(
        { success: false, error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que la cotización vinculada es del cliente
    if (reserva.cotizacion_id) {
      const cotizacion = await prisma.cotizaciones.findUnique({
        where: { id: reserva.cotizacion_id },
        select: { cliente_id: true },
      });

      if (cotizacion?.cliente_id !== sesion.cliente_id) {
        return NextResponse.json(
          { success: false, error: 'no_autorizado' },
          { status: 403 }
        );
      }
    }

    // Cancelar la reserva
    await prisma.reservas_stock.update({
      where: { id: BigInt(reservaId) },
      data: { estado: 'cancelada' },
    });

    return NextResponse.json({
      success: true,
      mensaje: 'Reserva cancelada correctamente',
    });
  } catch (error: any) {
    console.error('[Portal] Error en cancelar reserva:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

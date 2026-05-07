export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireServerAuth } from '@/lib/auth/server';

// ─────────────────────────────────────────────────────────────
// Helper: obtener el cliente_id del usuario autenticado
// ─────────────────────────────────────────────────────────────
async function obtenerClienteSesion() {
  const auth = await requireServerAuth();
  if (!auth.success) {
    return { error: auth.error, status: auth.status };
  }

  const clienteDb = await prisma.clientes.findFirst({
    where: { usuario_id: auth.user.id },
    select: { id: true, razon_social: true, ruc: true, activo: true },
  });

  if (!clienteDb) {
    return { error: 'cliente_no_encontrado' as const, status: 404 };
  }

  return {
    auth_user_id: auth.user.authId,
    usuario_id: auth.user.id,
    cliente_id: clienteDb.id,
    cliente: clienteDb,
  };
}

// ─────────────────────────────────────────────────────────────
// GET: Historial de cotizaciones
// ─────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const sesion = await obtenerClienteSesion();
    if ('error' in sesion) {
      return NextResponse.json({ success: false, error: sesion.error }, { status: sesion.status });
    }

    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado');

    const where: any = { cliente_id: sesion.cliente_id };
    if (estado && estado !== 'todos') where.estado = estado;

    const cotizaciones = await prisma.cotizaciones.findMany({
      where,
      include: {
        cotizacion_items: {
          include: {
            productos: { select: { id: true, nombre: true, sku: true } },
            variantes_producto: { select: { id: true, nombre: true, color: true, talla: true } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const data = cotizaciones.map((c) => ({
      ...serializeBigInt(c),
      esta_expirada: c.expira_at ? new Date(c.expira_at) < new Date() : false,
      items_count: c.cotizacion_items.length,
    }));

    return NextResponse.json({ success: true, data, cliente: serializeBigInt(sesion.cliente) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// POST: Crear cotización (Corregido)
// ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const sesion = await obtenerClienteSesion();
    if ('error' in sesion) {
      return NextResponse.json({ success: false, error: sesion.error }, { status: sesion.status });
    }

    const body = await req.json();
    const { items, notas_internas, direccion_despacho, metodo_pago, moneda, estado } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Items requeridos' }, { status: 400 });
    }

    // ── Cálculo de Totales ──
    const itemsCalculo = items.map((item: any) => ({
      precioBase: Number(item.precio_unitario),
      cantidad: Number(item.cantidad),
    }));

    const totales = calcularTotalesCotizacion(itemsCalculo);

    if (!totales.cumpleMOQ) {
      return NextResponse.json({
        success: false,
        error: 'error_negocio',
        mensaje: `No se cumple el MOQ de 400 unidades.`,
        detalle: totales,
      }, { status: 400 });
    }

    const count = await prisma.cotizaciones.count();
    const numero = `COT-${String(count + 1).padStart(6, '0')}`;
    const validaHasta = new Date();
    validaHasta.setDate(validaHasta.getDate() + 7);

    // ── Inserción en DB con Tipado Unchecked (Limpia error 2322) ──
    console.log('data: ', {
        numero,
        cliente_id: sesion.cliente_id,
        estado: estado ?? 'borrador',
        subtotal: new Prisma.Decimal(totales.subtotalBruto),
        igv: new Prisma.Decimal(totales.igv),
        total: new Prisma.Decimal(totales.total),
        valida_hasta: validaHasta,
        expira_at: validaHasta,
        //metodo_pago: metodo_pago ?? null,
        direccion_despacho: direccion_despacho ?? null,
        monto_descuento: new Prisma.Decimal(totales.montoDescuento),
        moneda: moneda ?? 'PEN',
        notas_internas: notas_internas ?? null,
        cotizacion_items: {
          create: items.map((item: any) => ({
            producto_id:              BigInt(item.producto_id),
            variante_id:              item.variante_id ? BigInt(item.variante_id) : null,
            cantidad:                 Number(item.cantidad),
            precio_unitario_snapshot: new Prisma.Decimal(item.precio_unitario),
            subtotal:                 new Prisma.Decimal(item.cantidad * item.precio_unitario),
            color_snapshot:           item.color_snapshot || 'N/A',
            talla_snapshot:           item.talla_snapshot || 'N/A',
            modelo_snapshot:          item.modelo_snapshot || null,
            prenda_tipo_snapshot:     item.prenda_tipo_snapshot || null,
          })) as Prisma.cotizacion_itemsUncheckedCreateWithoutCotizacionesInput[],
        },
      })
    const cotizacion = await prisma.cotizaciones.create({
      data: {
        numero,
        cliente_id: sesion.cliente_id,
        estado: estado ?? 'borrador',
        subtotal: new Prisma.Decimal(totales.subtotalBruto),
        igv: new Prisma.Decimal(totales.igv),
        total: new Prisma.Decimal(totales.total),
        valida_hasta: validaHasta,
        expira_at: validaHasta,
        //metodo_pago: metodo_pago ?? null,
        direccion_despacho: direccion_despacho ?? null,
        monto_descuento: new Prisma.Decimal(totales.montoDescuento),
        moneda: moneda ?? 'PEN',
        notas_internas: notas_internas ?? null,
        cotizacion_items: {
          create: items.map((item: any) => ({
            producto_id:              BigInt(item.producto_id),
            variante_id:              item.variante_id ? BigInt(item.variante_id) : null,
            cantidad:                 Number(item.cantidad),
            precio_unitario_snapshot: new Prisma.Decimal(item.precio_unitario),
            subtotal:                 new Prisma.Decimal(item.cantidad * item.precio_unitario),
            color_snapshot:           item.color_snapshot || 'N/A',
            talla_snapshot:           item.talla_snapshot || 'N/A',
            modelo_snapshot:          item.modelo_snapshot || null,
            prenda_tipo_snapshot:     item.prenda_tipo_snapshot || null,
          })) as Prisma.cotizacion_itemsUncheckedCreateWithoutCotizacionesInput[],
        },
      },
      include: {
        cotizacion_items: {
          include: {
            productos: { select: { id: true, nombre: true } },
            variantes_producto: { select: { id: true, nombre: true, color: true, talla: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: serializeBigInt(cotizacion),
      calculo: totales,
    }, { status: 201 });

  } catch (error: any) {
    console.error('[Portal] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ── Lógica de Negocio (Calculadora B2B) ──
const ESCALAS_DESCUENTO = [
  { min: 400, dcto: 0.0 },
  { min: 1000, dcto: 0.05 },
  { min: 5000, dcto: 0.12 },
  { min: 10000, dcto: 0.18 },
];
const MOQ_GENERAL = 400;

function calcularTotalesCotizacion(items: { precioBase: number; cantidad: number }[]) {
  const subtotalBruto = items.reduce((acc, i) => acc + i.precioBase * i.cantidad, 0);
  const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);
  const escala = [...ESCALAS_DESCUENTO].reverse().find((r) => cantidadTotal >= r.min);

  const montoDescuento = subtotalBruto * (escala?.dcto ?? 0);
  const subtotalConDescuento = subtotalBruto - montoDescuento;
  const igv = subtotalConDescuento * 0.18;

  return {
    subtotalBruto,
    cantidadTotal,
    montoDescuento,
    total: subtotalConDescuento + igv,
    igv,
    cumpleMOQ: cantidadTotal >= MOQ_GENERAL,
  };
}
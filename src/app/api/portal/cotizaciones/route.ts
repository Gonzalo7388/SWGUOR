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

  // Buscar el registro en la tabla `usuarios` vinculado al auth_id
  const usuarioDb = await prisma.usuarios.findFirst({
    where: { auth_id: user.id },
    select: { id: true, estado: true, rol: true },
  });

  if (!usuarioDb) return { error: 'usuario_no_encontrado' as const };

  // Buscar el cliente vinculado a este usuario
  const clienteDb = await prisma.clientes.findFirst({
    where: { usuario_id: usuarioDb.id },
    select: { id: true, razon_social: true, ruc: true, activo: true },
  });

  if (!clienteDb) return { error: 'cliente_no_encontrado' as const };

  return {
    auth_user_id: user.id,
    usuario_id: usuarioDb.id,
    cliente_id: clienteDb.id,
    cliente: clienteDb,
  };
}

// ─────────────────────────────────────────────────────────────
// GET: Historial de cotizaciones del cliente autenticado
// ─────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const sesion = await obtenerClienteSesion();
    if ('error' in sesion) {
      return NextResponse.json(
        { success: false, error: sesion.error },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado');

    const where: Record<string, unknown> = {
      cliente_id: sesion.cliente_id,
    };
    if (estado && estado !== 'todos') where.estado = estado;

    const cotizaciones = await prisma.cotizaciones.findMany({
      where,
      include: {
        cotizacion_items: {
          include: {
            productos: { select: { id: true, nombre: true, sku: true } },
            variantes_producto: {
              select: { id: true, nombre: true, color: true, talla: true },
            },
          },
        },
        pedidos: { select: { id: true, estado: true } },
        reglas_descuento: {
          select: { id: true, nombre: true, descuento_pct: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const data = cotizaciones.map((c) => ({
      ...serializeBigInt(c),
      esta_expirada: c.expira_at ? new Date(c.expira_at) < new Date() : false,
      items_count: c.cotizacion_items.length,
    }));

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      cliente: serializeBigInt(sesion.cliente),
    });
  } catch (error: any) {
    console.error('[Portal] Error en GET cotizaciones:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// POST: Crear cotización vinculada al cliente de la sesión
// Valida MOQ (400 unidades) usando calcularTotalesCotizacion
// ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const sesion = await obtenerClienteSesion();
    if ('error' in sesion) {
      return NextResponse.json(
        { success: false, error: sesion.error },
        { status: 401 }
      );
    }

    const body = await req.json();

    // No confiar en cliente_id del body — usar el de la sesión
    const { items, notas_internas, direccion_despacho, metodo_pago, moneda } =
      body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Se requieren items para la cotización' },
        { status: 400 }
      );
    }

    // Validar que cada item tenga campos mínimos
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.cantidad || item.cantidad < 1) {
        return NextResponse.json(
          {
            success: false,
            error: `El item ${i + 1} debe tener una cantidad válida`,
          },
          { status: 400 }
        );
      }
      if (item.precio_unitario == null || item.precio_unitario < 0) {
        return NextResponse.json(
          {
            success: false,
            error: `El item ${i + 1} debe tener un precio_unitario válido`,
          },
          { status: 400 }
        );
      }
    }

    // ── Calcular totales con la lógica de negocio B2B ──
    const itemsCalculo = items.map((item: any) => ({
      precioBase: Number(item.precio_unitario),
      cantidad: Number(item.cantidad),
    }));

    const totales = calcularTotalesCotizacion(itemsCalculo);

    if (!totales.cumpleMOQ) {
      return NextResponse.json(
        {
          success: false,
          error: 'error_negocio',
          mensaje: `No se cumple el MOQ de 400 unidades. Cantidad actual: ${totales.cantidadTotal}`,
          detalle: totales,
        },
        { status: 400 }
      );
    }

    // Generar número de cotización
    const count = await prisma.cotizaciones.count();
    const numero = `COT-${String(count + 1).padStart(6, '0')}`;

    const validaHasta = new Date();
    validaHasta.setDate(validaHasta.getDate() + 7);

    const cotizacion = await prisma.cotizaciones.create({
      data: {
        numero,
        cliente_id: sesion.cliente_id,
        estado: 'borrador',
        subtotal: totales.subtotalBruto,
        igv: totales.igv,
        total: totales.total,
        valida_hasta: validaHasta,
        expira_at: validaHasta,
        metodo_pago: metodo_pago ?? null,
        direccion_despacho: direccion_despacho ?? null,
        monto_descuento: totales.montoDescuento,
        costo_envio: body.costo_envio ?? 0,
        moneda: moneda ?? 'PEN',
        costo_total_estimado: totales.total,
        notas_internas: notas_internas ?? null,
        aprobacion_automatica: body.aprobacion_automatica ?? false,
        cotizacion_items: {
          create: items.map((item: any) => ({
            producto_id: item.producto_id
              ? BigInt(item.producto_id)
              : null,
            variante_id: item.variante_id
              ? BigInt(item.variante_id)
              : null,
            cantidad: item.cantidad,
            precio_unitario_snapshot: item.precio_unitario,
            subtotal: item.cantidad * item.precio_unitario,
            color_snapshot: item.color_snapshot || null,
            talla_snapshot: item.talla_snapshot || null,
          })),
        },
      },
      include: {
        cotizacion_items: {
          include: {
            productos: { select: { id: true, nombre: true } },
            variantes_producto: {
              select: { id: true, nombre: true, color: true, talla: true },
            },
          },
        },
        clientes: { select: { id: true, razon_social: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: serializeBigInt(cotizacion),
        calculo: totales,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Portal] Error en POST cotizaciones:', error);
    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: 'Producto o variante no encontrado' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Calculadora B2B — reimportada para usarla directamente aquí
// (evita dependencias de Supabase en el helper original)
// ─────────────────────────────────────────────────────────────

const ESCALAS_DESCUENTO = [
  { min: 400, dcto: 0.0 },
  { min: 1000, dcto: 0.05 },
  { min: 5000, dcto: 0.12 },
  { min: 10000, dcto: 0.18 },
];
const MOQ_GENERAL = 400;

interface ItemCalculo {
  precioBase: number;
  cantidad: number;
}

function calcularTotalesCotizacion(items: ItemCalculo[]) {
  const subtotalBruto = items.reduce(
    (acc, item) => acc + item.precioBase * item.cantidad,
    0
  );
  const cantidadTotal = items.reduce((acc, item) => acc + item.cantidad, 0);

  const escala = [...ESCALAS_DESCUENTO]
    .reverse()
    .find((r) => cantidadTotal >= r.min);

  const porcentajeDescuento = (escala?.dcto ?? 0) * 100;
  const montoDescuento = subtotalBruto * (escala?.dcto ?? 0);
  const subtotalConDescuento = subtotalBruto - montoDescuento;
  const igv = subtotalConDescuento * 0.18;
  const total = subtotalConDescuento + igv;

  return {
    subtotalBruto,
    cantidadTotal,
    porcentajeDescuento,
    montoDescuento,
    subtotalConDescuento,
    igv,
    total,
    cumpleMOQ: cantidadTotal >= MOQ_GENERAL,
  };
}

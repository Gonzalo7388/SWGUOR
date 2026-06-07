export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';
import { ordenesCompraService } from '@/lib/services/ordenes-compra.service';
import { getOrdenCompraPdfPublicUrl } from '@/lib/services/orden-compra-documento.service';
import { serializeBigInt } from '@/lib/utils/serialize';
import {
  crearOrdenCompraSchema,
  listarOrdenesCompraSchema,
} from '@/lib/schemas/ordenes-compra';
import type { EstadoOrdenCompra } from '@prisma/client'; // <-- Asegúrate de que tu tipo se llame así o impórtalo desde donde lo tengas definido

const ORDENES_COMPRA_ROLES: RolUsuario[] = [
  'administrador',
  'gerente',
  'almacenero',
];

export async function GET(req: Request) {
  const auth = await requireServerRole(ORDENES_COMPRA_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);

    // Soportar estado con múltiples valores separados por coma
    const estadoRaw = searchParams.get('estado') ?? undefined;
    let estadoFilter: string | EstadoOrdenCompra[] | undefined; // <-- Cambiado string[] por EstadoOrdenCompra[]

    if (estadoRaw && estadoRaw.includes(',')) {
      // <-- CORRECCIÓN: Se añade 'as EstadoOrdenCompra' en el map
      estadoFilter = estadoRaw.split(',').map(s => s.trim() as EstadoOrdenCompra);
    } else {
      estadoFilter = estadoRaw;
    }

    const parsed = listarOrdenesCompraSchema.safeParse({
      proveedor_id: searchParams.get('proveedor_id') ?? undefined,
      estado: Array.isArray(estadoFilter) ? undefined : estadoFilter,
      estado_pago: searchParams.get('estado_pago') ?? undefined,
      cotizacion_proveedor_id: searchParams.get('cotizacion_proveedor_id') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Parámetros inválidos' },
        { status: 400 },
      );
    }

    // Si se pasaron múltiples estados, usar filtro `in` directamente
    const filtros = Array.isArray(estadoFilter)
      ? { ...parsed.data, estado_in: estadoFilter }
      : parsed.data;

    const ordenes = await ordenesCompraService.listar(filtros);
    const conPdf = ordenes.map((o) => ({
      ...o,
      pdf_url: getOrdenCompraPdfPublicUrl(String(o.id)),
    }));
    return NextResponse.json({ success: true, data: serializeBigInt(conPdf) });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[GET ordenes-compra]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireServerRole(ORDENES_COMPRA_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = crearOrdenCompraSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
        { status: 400 },
      );
    }

    const orden = await ordenesCompraService.crearConItems(
      parsed.data,
      auth.user.authId,
    );

    return NextResponse.json(
      {
        success: true,
        data: serializeBigInt({
          ...orden,
          pdf_url: getOrdenCompraPdfPublicUrl(String(orden.id)),
        }),
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[POST ordenes-compra]', msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
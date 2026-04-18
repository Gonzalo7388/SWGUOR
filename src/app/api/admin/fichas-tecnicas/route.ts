export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getRolUsuario() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('auth_id', user.id)
    .single();
  return data?.rol ?? null;
}

const ROLES_PERMITIDOS = ['disenador', 'cortador', 'administrador', 'gerente'];

// ── GET: Obtener ficha por producto ───────────────────────────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const producto_id = searchParams.get('producto_id');

    if (!producto_id) {
      return NextResponse.json({ error: 'producto_id requerido' }, { status: 400 });
    }

    const ficha = await prisma.fichas_tecnicas.findFirst({
      where: { id_producto: BigInt(producto_id) },
      include: { medidas: { orderBy: [{ talla: 'asc' }, { punto_medida: 'asc' }] } },
    });

    return NextResponse.json({ success: true, data: serializeBigInt(ficha) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── POST: Crear ficha técnica ─────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const rol = await getRolUsuario();
    if (!rol || !ROLES_PERMITIDOS.includes(rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { producto_id, version, descripcion_detallada, sam_total, costo_estimado, ficha_url, imagen_geometral } = body;

    if (!producto_id) {
      return NextResponse.json({ error: 'producto_id requerido' }, { status: 400 });
    }

    // Verificar si ya existe
    const existe = await prisma.fichas_tecnicas.findFirst({
      where: { id_producto: BigInt(producto_id) },
    });

    if (existe) {
      return NextResponse.json({ error: 'Ya existe una ficha para este producto. Use PUT para actualizar.' }, { status: 409 });
    }

    const ficha = await prisma.$transaction(async (tx) => {
      const nuevaFicha = await tx.fichas_tecnicas.create({
        data: {
          id_producto:          BigInt(producto_id),
          version:              version              ?? '1.0',
          descripcion_detallada: descripcion_detallada ?? null,
          sam_total:            sam_total            ?? null,
          costo_estimado:       costo_estimado       ?? null,
          ficha_url:            ficha_url            ?? null,
          imagen_geometral:     imagen_geometral     ?? null,
          estado:               'borrador',
        },
      });

      // Vincular ficha al producto
      await tx.productos.update({
        where: { id: BigInt(producto_id) },
        data:  { fichas_tecnicas_id: nuevaFicha.id },
      });

      return nuevaFicha;
    });

    return NextResponse.json({ success: true, data: serializeBigInt(ficha) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── PUT: Actualizar ficha técnica ─────────────────────────────────────────
export async function PUT(req: Request) {
  try {
    const rol = await getRolUsuario();
    if (!rol || !ROLES_PERMITIDOS.includes(rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { id, version, descripcion_detallada, sam_total, costo_estimado, ficha_url, imagen_geometral, estado } = body;

    if (!id) {
      return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    }

    const ficha = await prisma.fichas_tecnicas.update({
      where: { id: BigInt(id) },
      data: {
        ...(version              !== undefined && { version }),
        ...(descripcion_detallada !== undefined && { descripcion_detallada }),
        ...(sam_total            !== undefined && { sam_total }),
        ...(costo_estimado       !== undefined && { costo_estimado }),
        ...(ficha_url            !== undefined && { ficha_url }),
        ...(imagen_geometral     !== undefined && { imagen_geometral }),
        ...(estado               !== undefined && { estado }),
      },
    });

    return NextResponse.json({ success: true, data: serializeBigInt(ficha) });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Ficha no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
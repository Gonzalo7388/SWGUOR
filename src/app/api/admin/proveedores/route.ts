export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { serializeBigInt } from '@/lib/utils/serialize';
import {
  getProveedores,
  upsertProveedor,
  getHistorialOrdenes,
  getProveedorById,
} from '@/lib/services/proveedor-services';
import { NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────
// Helper: validar rol de administrador
// ─────────────────────────────────────────────────────────────
async function validarAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'no_auth' as const, status: 401 };

  const usuarioDb = await prisma.usuarios.findFirst({
    where: { auth_id: user.id },
    select: { id: true, rol: true, estado: true },
  });

  if (!usuarioDb) return { error: 'usuario_no_encontrado' as const, status: 404 };
  if (usuarioDb.estado !== 'activo') return { error: 'usuario_inactivo' as const, status: 403 };

  const rolesAdmin = ['administrador', 'gerente'];
  if (!usuarioDb.rol || !rolesAdmin.includes(usuarioDb.rol)) {
    return { error: 'sin_permisos' as const, status: 403 };
  }

  return { usuario_id: usuarioDb.id, rol: usuarioDb.rol };
}

// ─────────────────────────────────────────────────────────────
// GET: Listado de proveedores con filtros y paginación
//    ?busqueda=, ?estado=, ?categoria_suministro=, ?page=, ?limit=
//    ?id=<proveedor_id> → detalle de un proveedor
//    ?id=<proveedor_id>&historial=1 → historial de órdenes
// ─────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const auth = await validarAdmin();
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const proveedorId = searchParams.get('id');
    const historial = searchParams.get('historial');

    // ── Detalle de un proveedor ──
    if (proveedorId) {
      const proveedor = await getProveedorById(BigInt(proveedorId));

      if (!proveedor) {
        return NextResponse.json(
          { success: false, error: 'Proveedor no encontrado' },
          { status: 404 }
        );
      }

      // Si se pide historial de órdenes
      if (historial === '1') {
        const ordenes = await getHistorialOrdenes(proveedor.id);
        return NextResponse.json({
          success: true,
          data: serializeBigInt({
            ...proveedor,
            historial_ordenes: ordenes,
          }),
        });
      }

      return NextResponse.json({
        success: true,
        data: serializeBigInt(proveedor),
      });
    }

    // ── Listado con filtros ──
    const result = await getProveedores({
      estado: searchParams.get('estado') as 'activo' | 'inactivo' | undefined,
      categoria_suministro: searchParams.get('categoria_suministro') ?? undefined,
      busqueda: searchParams.get('busqueda') ?? undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    });

    return NextResponse.json({
      success: true,
      data: serializeBigInt(result.data),
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      },
    });
  } catch (error: any) {
    console.error('[Admin] Error en GET proveedores:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// POST: Crear o actualizar proveedor
// Body: { id?, ruc, razon_social, contacto, telefono, email, direccion, categoria_suministro, estado? }
// ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const auth = await validarAdmin();
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();

    // Validaciones de campos obligatorios
    const camposRequeridos = ['ruc', 'razon_social', 'contacto', 'telefono', 'email', 'direccion', 'categoria_suministro'];
    for (const campo of camposRequeridos) {
      if (!body[campo]) {
        return NextResponse.json(
          { success: false, error: `El campo "${campo}" es obligatorio` },
          { status: 400 }
        );
      }
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Validar RUC (11 dígitos numéricos)
    const rucLimpio = body.ruc.trim();
    if (!/^\d{11}$/.test(rucLimpio)) {
      return NextResponse.json(
        { success: false, error: 'El RUC debe tener exactamente 11 dígitos numéricos' },
        { status: 400 }
      );
    }

    // Validar estado si se proporciona
    if (body.estado && !['activo', 'inactivo'].includes(body.estado)) {
      return NextResponse.json(
        { success: false, error: 'Estado debe ser "activo" o "inactivo"' },
        { status: 400 }
      );
    }

    const proveedor = await upsertProveedor({
      id: body.id ? BigInt(body.id) : undefined,
      ruc: rucLimpio,
      razon_social: body.razon_social,
      contacto: body.contacto,
      telefono: body.telefono,
      email: body.email,
      direccion: body.direccion,
      categoria_suministro: body.categoria_suministro,
      estado: body.estado ?? 'activo',
    });

    return NextResponse.json(
      { success: true, data: serializeBigInt(proveedor) },
      { status: body.id ? 200 : 201 }
    );
  } catch (error: any) {
    console.error('[Admin] Error en POST proveedores:', error);

    // P2002: Unique constraint violated (RUC o email duplicado)
    if (error.code === 'P2002') {
      const campo = error.meta?.target?.[0] ?? 'campo';
      const mensaje =
        campo === 'ruc'
          ? 'Ya existe un proveedor con ese RUC'
          : campo === 'email'
            ? 'Ya existe un proveedor con ese email'
            : `Ya existe un proveedor con ese ${campo}`;

      return NextResponse.json(
        { success: false, error: mensaje, campo },
        { status: 409 }
      );
    }

    // P2025: Record not found (al actualizar un ID inexistente)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Proveedor no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE: Borrado lógico — cambia estado a "inactivo"
//    ?id=<proveedor_id>
// ─────────────────────────────────────────────────────────────
export async function DELETE(req: Request) {
  try {
    const auth = await validarAdmin();
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID del proveedor requerido' },
        { status: 400 }
      );
    }

    const proveedorId = BigInt(id);

    // Verificar que existe
    const existente = await prisma.proveedores.findUnique({
      where: { id: proveedorId },
      select: { id: true, razon_social: true, estado: true },
    });

    if (!existente) {
      return NextResponse.json(
        { success: false, error: 'Proveedor no encontrado' },
        { status: 404 }
      );
    }

    // Borrado lógico: cambiar estado a inactivo
    const proveedor = await prisma.proveedores.update({
      where: { id: proveedorId },
      data: { estado: 'inactivo' },
    });

    return NextResponse.json({
      success: true,
      message: `Proveedor "${existente.razon_social}" desactivado correctamente`,
      data: serializeBigInt(proveedor),
    });
  } catch (error: any) {
    console.error('[Admin] Error en DELETE proveedores:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Proveedor no encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
import { ClientesService } from '@/lib/services/clientes-services';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';
import { NextResponse }    from 'next/server';

const CLIENTES_ROLES: RolUsuario[] = ['administrador', 'gerente', 'recepcionista'];

// GET /api/admin/clientes?busqueda=xxx&estado=xxx
export async function GET(req: Request) {
  const auth = await requireServerRole(CLIENTES_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const { searchParams } = new URL(req.url);
    const data = await ClientesService.listar({
      busqueda: searchParams.get('busqueda') ?? undefined,
      estado:   searchParams.get('estado')   ?? undefined,
    });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[GET /clientes]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/clientes — crea usuario Auth + clientes
export async function POST(req: Request) {
  const auth = await requireServerRole(CLIENTES_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { ruc, email, password } = body;

    if (!ruc)      return NextResponse.json({ error: 'ruc requerido' },      { status: 400 });
    if (!email)    return NextResponse.json({ error: 'email requerido' },    { status: 400 });
    if (!password) return NextResponse.json({ error: 'password requerido' }, { status: 400 });

    const cliente = await ClientesService.crear(body);
    return NextResponse.json({ success: true, data: cliente }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /clientes]', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'RUC o email ya registrado' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/clientes — actualiza datos del cliente
export async function PUT(req: Request) {
  const auth = await requireServerRole(CLIENTES_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Sin campos para actualizar' }, { status: 400 });
    }

    const cliente = await ClientesService.actualizar(id, data);
    return NextResponse.json({ success: true, data: cliente });
  } catch (error: any) {
    console.error('[PUT /clientes]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
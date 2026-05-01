export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/auth/server';

async function obtenerClienteSesion() {
  const auth = await requireServerAuth();
  if (!auth.success) {
    return { error: auth.error, status: auth.status };
  }

  const clienteDb = await prisma.clientes.findFirst({
    where: { usuario_id: auth.user.id },
  });

  if (!clienteDb) {
    return { error: 'cliente_no_encontrado' as const, status: 404 };
  }

  return {
    auth_user_id: auth.user.authId,
    usuario_id:   auth.user.id,
    usuario:      auth.user,
    cliente_id:   clienteDb.id,
    cliente:      clienteDb,
  };
}

// GET: Perfil del cliente autenticado
export async function GET() {
  try {
    const sesion = await obtenerClienteSesion();
    if ('error' in sesion) {
      return NextResponse.json(
        { success: false, error: sesion.error },
        { status: sesion.error ? 401 : 404 }
      );
    }

    const direcciones = await prisma.direcciones_cliente.findMany({
      where: { cliente_id: sesion.cliente_id },
      orderBy: { es_principal: 'desc' },
    });

    const [cotizacionesCount, pedidosCount] = await Promise.all([
      prisma.cotizaciones.count({ where: { cliente_id: sesion.cliente_id } }),
      prisma.pedidos.count({     where: { cliente_id: sesion.cliente_id } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        cliente:     serializeBigInt(sesion.cliente),
        usuario:     serializeBigInt(sesion.usuario),
        direcciones: serializeBigInt(direcciones),
        stats: { cotizaciones: cotizacionesCount, pedidos: pedidosCount },
      },
    });
  } catch (error: any) {
    console.error('[Portal] Error en GET perfil:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Actualizar datos del perfil del cliente
export async function PATCH(req: Request) {
  try {
    const sesion = await obtenerClienteSesion();
    if ('error' in sesion) {
      return NextResponse.json(
        { success: false, error: sesion.error },
        { status: sesion.error ? 401 : 404 }
      );
    }

    const body = await req.json();

    const CAMPOS_PERMITIDOS = ['razon_social', 'ruc', 'telefono', 'email', 'direccion_fiscal', 'tipo_cliente'];

    const dataCliente: Record<string, unknown> = {};
    for (const campo of CAMPOS_PERMITIDOS) {
      if (body[campo] !== undefined) dataCliente[campo] = body[campo];
    }

    if (dataCliente.ruc !== undefined) {
      const rucNum = Number(body.ruc);
      if (isNaN(rucNum) || rucNum.toString().length !== 11) {
        return NextResponse.json(
          { success: false, error: 'El RUC debe tener 11 dígitos numéricos' },
          { status: 400 }
        );
      }
      dataCliente.ruc = String(rucNum);

      const rucExistente = await prisma.clientes.findFirst({
        where: { ruc: String(rucNum), id: { not: sesion.cliente_id } },
      });
      if (rucExistente) {
        return NextResponse.json({ success: false, error: 'Ese RUC ya está registrado' }, { status: 409 });
      }
    }

    if (body.telefono !== undefined && body.telefono !== null) {
      dataCliente.telefono = String(body.telefono); // telefono en clientes es varchar
    }

    if (body.email !== undefined && body.email !== null) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json({ success: false, error: 'Formato de email inválido' }, { status: 400 });
      }
      dataCliente.email = body.email;
    }

    const clienteActualizado = await prisma.clientes.update({
      where: { id: sesion.cliente_id },
      data:  dataCliente,
    });

    // Si cambia razón_social, actualizar nombre_completo en personal_interno (no en usuarios)
    // Para clientes, razon_social ya queda en clientes — no hay nada que actualizar en usuarios.

    return NextResponse.json({ success: true, data: serializeBigInt(clienteActualizado) });
  } catch (error: any) {
    console.error('[Portal] Error en PATCH perfil:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Cliente no encontrado' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Email duplicado' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────
// Helper compartido: obtener datos de sesión del cliente
// ─────────────────────────────────────────────────────────────
async function obtenerClienteSesion() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'no_auth' as const };

  // Usuario vinculado al auth_id
  const usuarioDb = await prisma.usuarios.findFirst({
    where: { auth_id: user.id },
    select: { id: true, estado: true, rol: true, nombre_completo: true, email: true },
  });

  if (!usuarioDb) return { error: 'usuario_no_encontrado' as const };

  // Cliente vinculado al usuario
  const clienteDb = await prisma.clientes.findFirst({
    where: { usuario_id: usuarioDb.id },
  });

  if (!clienteDb) return { error: 'cliente_no_encontrado' as const };

  return {
    auth_user_id: user.id,
    usuario_id: usuarioDb.id,
    usuario: usuarioDb,
    cliente_id: clienteDb.id,
    cliente: clienteDb,
  };
}

// ─────────────────────────────────────────────────────────────
// GET: Perfil del cliente autenticado
// ─────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const sesion = await obtenerClienteSesion();
    if ('error' in sesion) {
      const status = sesion.error === 'no_auth' ? 401 : 404;
      return NextResponse.json(
        { success: false, error: sesion.error },
        { status }
      );
    }

    // Obtener direcciones del cliente
    const direcciones = await prisma.direcciones_cliente.findMany({
      where: { cliente_id: sesion.cliente_id },
      orderBy: { es_principal: 'desc' },
    });

    // Contar cotizaciones y pedidos del cliente
    const [cotizacionesCount, pedidosCount, ordenesCount] =
      await Promise.all([
        prisma.cotizaciones.count({ where: { cliente_id: sesion.cliente_id } }),
        prisma.pedidos.count({ where: { cliente_id: sesion.cliente_id } }),
        prisma.ordenes.count({ where: { cliente_id: sesion.cliente_id } }),
      ]);

    const perfil = {
      cliente: serializeBigInt(sesion.cliente),
      usuario: serializeBigInt(sesion.usuario),
      direcciones: serializeBigInt(direcciones),
      stats: {
        cotizaciones: cotizacionesCount,
        pedidos: pedidosCount,
        ordenes: ordenesCount,
      },
    };

    return NextResponse.json({ success: true, data: perfil });
  } catch (error: any) {
    console.error('[Portal] Error en GET perfil:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// PATCH: Actualizar datos del perfil del cliente
// Solo permite modificar: razon_social, ruc, telefono, email, direccion
// NO se confía en campos como usuario_id o id que vengan del body
// ─────────────────────────────────────────────────────────────
export async function PATCH(req: Request) {
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

    // Campos permitidos para actualización por el cliente
    const CAMPOS_PERMITIDOS = [
      'razon_social',
      'ruc',
      'telefono',
      'email',
      'direccion',
      'TipoCliente',
    ];

    // Filtrar solo campos permitidos — ignorar cualquier otro campo del body
    const dataCliente: Record<string, unknown> = {};
    for (const campo of CAMPOS_PERMITIDOS) {
      if (body[campo] !== undefined) {
        dataCliente[campo] = body[campo];
      }
    }

    // Validaciones específicas
    if (dataCliente.ruc !== undefined) {
      const rucNum = Number(body.ruc);
      if (isNaN(rucNum) || rucNum.toString().length !== 11) {
        return NextResponse.json(
          { success: false, error: 'El RUC debe tener 11 dígitos numéricos' },
          { status: 400 }
        );
      }
      dataCliente.ruc = rucNum;

      // Verificar RUC duplicado (excluyendo al propio cliente)
      const rucExistente = await prisma.clientes.findFirst({
        where: {
          ruc: BigInt(rucNum),
          id: { not: sesion.cliente_id },
        },
      });
      if (rucExistente) {
        return NextResponse.json(
          { success: false, error: 'Ese RUC ya está registrado' },
          { status: 409 }
        );
      }
    }

    if (body.telefono !== undefined && body.telefono !== null) {
      dataCliente.telefono = BigInt(body.telefono);
    }

    if (body.email !== undefined && body.email !== null) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { success: false, error: 'Formato de email inválido' },
          { status: 400 }
        );
      }
      dataCliente.email = body.email;
    }

    // Actualizar cliente (solo el de la sesión)
    const clienteActualizado = await prisma.clientes.update({
      where: { id: sesion.cliente_id },
      data: dataCliente,
    });

    // También actualizar nombre_completo del usuario si se cambia razón_social
    if (body.razon_social !== undefined) {
      await prisma.usuarios.update({
        where: { id: sesion.usuario_id },
        data: { nombre_completo: body.razon_social },
      });
    }

    return NextResponse.json({
      success: true,
      data: serializeBigInt(clienteActualizado),
    });
  } catch (error: any) {
    console.error('[Portal] Error en PATCH perfil:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Email duplicado' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

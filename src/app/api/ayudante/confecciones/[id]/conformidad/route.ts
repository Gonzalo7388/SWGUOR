export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';
import { aprobarConformidadConfeccion } from '@/lib/helpers/aprobar-conformidad-confeccion.helper';

const ROLES: RolUsuario[] = ['ayudante', 'administrador', 'gerente'];

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const auth = await requireServerRole(ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const resultado = await aprobarConformidadConfeccion({
      confeccionId: BigInt(id),
      usuarioId: BigInt(auth.user.id),
    });

    return NextResponse.json({
      success: true,
      data: {
        pedido_id: String(resultado.pedidoId),
        ya_aprobada: resultado.yaAprobada,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('[POST ayudante conformidad]', error);
    return NextResponse.json({ error: message }, { status: 422 });
  }
}

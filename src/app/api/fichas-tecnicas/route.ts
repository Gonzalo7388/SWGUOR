export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { FichasTecnicasService } from '@/lib/services/fichas-tecnicas.service';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';
import type { EstadoFicha } from '@prisma/client';
import { procesarFichaTecnicaAprobada } from '@/lib/helpers/ficha-tecnica-aprobacion.helper';

const ROLES_FICHA: RolUsuario[] = ['disenador', 'administrador', 'gerente'];

export async function GET(request: NextRequest) {
  const auth = await requireServerRole(ROLES_FICHA);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id_producto =
      searchParams.get('id_producto') ?? searchParams.get('producto_id');

    if (id_producto) {
      const data = await FichasTecnicasService.obtenerPorProducto(String(id_producto));
      if (!data) {
        return NextResponse.json({ success: true, data: null });
      }
      return NextResponse.json({ success: true, data });
    }

    const estado = searchParams.get('estado') as EstadoFicha | null;
    const busqueda = searchParams.get('busqueda') ?? undefined;
    const data = await FichasTecnicasService.listar({
      estado: estado ?? undefined,
      busqueda,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireServerRole(ROLES_FICHA);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const productoId = body.id_producto ?? body.producto_id ?? body.productoId;

    if (!productoId) {
      return NextResponse.json(
        { error: 'id_producto es obligatorio' },
        { status: 400 },
      );
    }

    const estado = (body.estado ?? 'borrador') as EstadoFicha;

    const fichaNueva = await FichasTecnicasService.crear({
      producto_id: productoId,
      version: body.version ?? '1.0',
      descripcion_detallada: body.descripcion_detallada ?? null,
      ficha_url: body.ficha_url ?? null,
      imagen_geometral: body.imagen_geometral ?? null,
      estado,
      created_by: auth.user.id,
    });

    if (estado === 'aprobada') {
      const pedidoId = body.pedido_id ?? body.pedidoId;
      if (!pedidoId) {
        return NextResponse.json(
          { error: 'pedido_id requerido al crear ficha aprobada' },
          { status: 400 },
        );
      }
      const fichaId = (fichaNueva as { id?: number | string }).id;
      await procesarFichaTecnicaAprobada({
        fichaId: BigInt(fichaId!),
        productoId: BigInt(productoId),
        pedidoId: BigInt(pedidoId),
        usuarioId: BigInt(auth.user.id),
      });
    }

    return NextResponse.json({ success: true, data: fichaNueva }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    const status = message.includes('Ya existe') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

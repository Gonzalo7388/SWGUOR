export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FichasTecnicasService } from '@/lib/services/fichas-tecnicas.service';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';
import type { EstadoFicha } from '@prisma/client';
import { procesarFichaTecnicaAprobada } from '@/lib/helpers/ficha-tecnica-aprobacion.helper';

const ROLES_FICHA: RolUsuario[] = ['disenador', 'administrador', 'gerente'];

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireServerRole(ROLES_FICHA);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const ficha = await FichasTecnicasService.obtenerPorId(id);
    if (!ficha) {
      return NextResponse.json({ error: 'Ficha no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: ficha });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireServerRole(ROLES_FICHA);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const fichaAntes = await prisma.fichas_tecnicas.findUnique({
      where: { id: BigInt(id) },
      select: { estado: true, id_producto: true },
    });

    if (!fichaAntes) {
      return NextResponse.json({ error: 'Ficha no encontrada' }, { status: 404 });
    }

    const data: Partial<{
      version: string;
      descripcion_detallada: string;
      ficha_url: string;
      imagen_geometral: string;
      estado: EstadoFicha;
    }> = {};

    if (body.version !== undefined) data.version = body.version;
    if (body.descripcion_detallada !== undefined) {
      data.descripcion_detallada = body.descripcion_detallada;
    }
    if (body.ficha_url !== undefined) data.ficha_url = body.ficha_url;
    if (body.imagen_geometral !== undefined) {
      data.imagen_geometral = body.imagen_geometral;
    }
    if (body.estado !== undefined) data.estado = body.estado;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 },
      );
    }

    const ficha = await FichasTecnicasService.actualizar(id, data);

    const nuevoEstado = data.estado ?? fichaAntes.estado;
    const pasoAAprobada =
      nuevoEstado === 'aprobada' && fichaAntes.estado !== 'aprobada';

    if (pasoAAprobada && fichaAntes.id_producto) {
      const pedidoId = body.pedido_id ?? body.pedidoId;
      if (!pedidoId) {
        return NextResponse.json(
          {
            error: 'pedido_id requerido al aprobar la ficha',
          },
          { status: 400 },
        );
      }

      await procesarFichaTecnicaAprobada({
        fichaId: BigInt(id),
        productoId: fichaAntes.id_producto,
        pedidoId: BigInt(pedidoId),
        usuarioId: BigInt(auth.user.id),
      });
    }

    return NextResponse.json({ success: true, data: ficha });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

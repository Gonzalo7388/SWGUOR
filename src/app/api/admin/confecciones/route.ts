export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

type Tx = Prisma.TransactionClient;

// GET: Obtener confecciones con filtros
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado');
    const tallerId = searchParams.get('taller');

    const where: Record<string, unknown> = {};
    if (estado && estado !== 'todos') where.estado = estado;
    if (tallerId && tallerId !== 'todos') where.taller_id = BigInt(tallerId);

    const confecciones = await prisma.confecciones.findMany({
      where,
      include: {
        taller: { select: { id: true, nombre: true } },
        pedido: {
          include: {
            clientes: { select: { id: true, razon_social: true } },
            pedido_items: {
              include: {
                productos: { select: { id: true, nombre: true } },
              },
            },
          },
        },
        responsable: {
          select: {
            id: true,
            // nombre_completo vive en personal_interno, no en usuarios
            personal_interno: { select: { nombre_completo: true } },
          },
        },
        incidencias_taller: { select: { id: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    // Formato enriquecido para el frontend
    const formatted = confecciones.map((conf) => {
      const primerItem = conf.pedido?.pedido_items?.[0];
      return {
        ...serializeBigInt(conf),
        pedido_id_link: conf.pedido?.id ?? null,
        cliente: conf.pedido?.clientes?.razon_social ?? 'N/A',
        prenda: primerItem?.productos?.nombre ?? 'N/A',
        cantidad: primerItem?.cantidad ?? conf.pedido?.total_unidades ?? 0,
        taller: conf.taller?.nombre ?? 'N/A',
        // Navegar a través de personal_interno para obtener el nombre
        responsable: conf.responsable?.personal_interno?.[0]?.nombre_completo ?? null,
        progreso: calcularProgreso(conf.estado),
        incidencias_count: conf.incidencias_taller.length,
      };
    });

    return NextResponse.json({ data: formatted, count: formatted.length });
  } catch (error: any) {
    console.error('Error fetching confecciones:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear una nueva confección
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.pedido_id || !body.taller_id) {
      return NextResponse.json(
        { error: 'pedido_id y taller_id son obligatorios' },
        { status: 400 }
      );
    }

    const confeccion = await prisma.confecciones.create({
      data: {
        pedido_id: BigInt(body.pedido_id),
        taller_id: BigInt(body.taller_id),
        estado: body.estado ?? 'corte',
        fecha_inicio: new Date(),
        observaciones: body.observaciones ?? null,
        responsable_id: body.responsable_id ? BigInt(body.responsable_id) : null,
      },
      include: {
        taller: { select: { id: true, nombre: true } },
        pedido: {
          include: {
            clientes: { select: { id: true, razon_social: true } },
          },
        },
      },
    });

    return NextResponse.json(serializeBigInt(confeccion), { status: 201 });
  } catch (error: any) {
    console.error('Error creating confeccion:', error);
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Pedido o taller no encontrado' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Actualizar confección + KPIs de producción
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, estado, observaciones } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const confeccion = await prisma.$transaction(async (tx: Tx) => {
      const confeccionActual = await tx.confecciones.findUnique({
        where: { id: BigInt(id) },
        include: {
          pedido: { include: { clientes: true } },
        },
      });

      if (!confeccionActual) {
        throw new Error('Confección no encontrada');
      }

      const data: Record<string, unknown> = {};
      if (estado) data.estado = estado;
      if (observaciones !== undefined) data.observaciones = observaciones;
      if (estado === 'terminado') data.fecha_fin = new Date();

      if (estado && confeccionActual.pedido) {
        const ordenKpiData: Record<string, unknown> = {};

        if (estado === 'corte') ordenKpiData.enviado_taller_at = new Date();
        if (estado === 'terminado') ordenKpiData.recibido_taller_at = new Date();

        const etapaMap: Record<string, string> = {
          corte: 'corte',
          confeccionando: 'confeccion',
          remallado: 'remallado',
          terminado: 'listo_entrega',
        };

        const etapa = etapaMap[estado];
        if (etapa) {
          await tx.estados_produccion.updateMany({
            where: { orden_id: confeccionActual.pedido.id, activo: true },
            data: { activo: false, completado_en: new Date() },
          });

          const inicio = new Date(confeccionActual.fecha_inicio).getTime();
          const duracionMinutos = Math.round((Date.now() - inicio) / 60000);

          await tx.estados_produccion.create({
            data: {
              orden_id: confeccionActual.pedido.id,
              etapa: etapa as any,
              usuario_id: body.usuario_id ? BigInt(body.usuario_id) : null,
              observaciones: observaciones ?? null,
              duracion_minutos: duracionMinutos,
            },
          });
        }

        if (Object.keys(ordenKpiData).length > 0) {
          await tx.ordenes.update({
            where: { id: confeccionActual.pedido.id },
            data: ordenKpiData,
          });
        }
      }

      const updated = await tx.confecciones.update({
        where: { id: BigInt(id) },
        data,
        include: {
          taller: { select: { id: true, nombre: true } },
          pedido: {
            include: {
              clientes: { select: { id: true, razon_social: true } },
            },
          },
        },
      });

      if (body.incidencias && Array.isArray(body.incidencias)) {
        for (const inc of body.incidencias) {
          await tx.incidencias_taller.create({
            data: {
              orden_id: confeccionActual.pedido?.id ?? BigInt(id),
              confeccion_id: BigInt(id),
              tipo: inc.tipo,
              severidad: inc.severidad ?? 'media',
              descripcion: inc.descripcion,
              reportado_por: inc.reportado_por ? BigInt(inc.reportado_por) : null,
              asignado_a: inc.asignado_a ? BigInt(inc.asignado_a) : null,
              impacto_horas: inc.impacto_horas ?? null,
              foto_url: inc.foto_url ?? null,
            },
          });
        }
      }

      return updated;
    });

    return NextResponse.json(serializeBigInt(confeccion));
  } catch (error: any) {
    console.error('Error updating confeccion:', error);
    if (error.code === 'P2025' || error.message === 'Confección no encontrada') {
      return NextResponse.json({ error: 'Confección no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar una confección
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await prisma.confecciones.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ message: 'Confección eliminada correctamente' });
  } catch (error: any) {
    console.error('Error deleting confeccion:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Confección no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── Utilitarios ────────────────────────────────────────────────────────────

function calcularProgreso(estado: string): number {
  const progressMap: Record<string, number> = {
    corte: 10,
    confeccionando: 40,
    remallado: 70,
    terminado: 100,
  };
  return progressMap[estado] ?? 0;
}
/**
 * API Route - Notificaciones con RPC
 * Endpoints para gestionar notificaciones del sistema
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

// ============================================================================
// GET - Obtener notificaciones
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const usuarioId = url.searchParams.get("usuarioId");
    const action = url.searchParams.get("action");
    const limit = url.searchParams.get("limit") || "50";
    const offset = url.searchParams.get("offset") || "0";

    if (!usuarioId || isNaN(Number(usuarioId))) {
      return NextResponse.json(
        { error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    // Obtener estadísticas
    if (action === "stats") {
      const unread = await prisma.notificaciones.count({
        where: { usuario_id: Number(usuarioId), leido: false },
      });
      return NextResponse.json({ success: true, data: { unread } });
    }

    // Obtener no leídas
    if (action === "no-leidas") {
      const [total, rows] = await Promise.all([
        prisma.notificaciones.count({ where: { usuario_id: Number(usuarioId), leido: false } }),
        prisma.notificaciones.findMany({
          where: { usuario_id: Number(usuarioId), leido: false },
          orderBy: { created_at: 'desc' },
          take: Number(limit),
          skip: Number(offset),
        }),
      ]);
      return NextResponse.json({ success: true, data: rows, total });
    }

    // Obtener con paginación (por defecto)
    const [total, rows] = await Promise.all([
      prisma.notificaciones.count({ where: { usuario_id: Number(usuarioId) } }),
      prisma.notificaciones.findMany({
        where: { usuario_id: Number(usuarioId) },
        orderBy: { created_at: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: rows,
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error("Error en GET notificaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener notificaciones" },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Crear notificación
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const notificacion = await prisma.notificaciones.create({
      data: {
        usuario_id: Number(body.usuarioId),
        tipo: body.tipo,
        titulo: body.titulo,
        mensaje: body.mensaje,
        referencia_tipo: body.referenciaType ?? null,
        referencia_id: body.referenciaId ?? null,
        url_destino: body.urlDestino ?? null,
        leido: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: notificacion,
        message: "Notificación creada exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST notificaciones:", error);
    return NextResponse.json(
      { error: "Error al crear notificación" },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Actualizar notificaciones (marcar como leída)
// ============================================================================
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "marcar-leida") {
      if (body.notificacionId) {
        await prisma.notificaciones.update({
          where: { id: BigInt(body.notificacionId) },
          data: { leido: true, leido_at: new Date() },
        });
      } else if (Array.isArray(body.notificacionIds)) {
        await prisma.notificaciones.updateMany({
          where: { id: { in: body.notificacionIds.map((id: string | number) => BigInt(id)) } },
          data: { leido: true, leido_at: new Date() },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Notificación(es) marcada(s) como leída(s)",
      });
    }

    if (action === "marcar-todas-leidas") {
      await prisma.notificaciones.updateMany({
        where: { usuario_id: Number(body.usuarioId), leido: false },
        data: { leido: true, leido_at: new Date() },
      });
      return NextResponse.json({
        success: true,
        message: "Todas las notificaciones marcadas como leídas",
      });
    }

    return NextResponse.json(
      { error: "Acción no válida" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error en PUT notificaciones:", error);
    return NextResponse.json(
      { error: "Error al actualizar notificación" },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Eliminar notificación(es)
// ============================================================================
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.notificacionId) {
      await prisma.notificaciones.delete({
        where: { id: BigInt(body.notificacionId) },
      });
    } else if (Array.isArray(body.notificacionIds)) {
      await prisma.notificaciones.deleteMany({
        where: { id: { in: body.notificacionIds.map((id: string | number) => BigInt(id)) } },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Notificación(es) eliminada(s) exitosamente",
    });
  } catch (error) {
    console.error("Error en DELETE notificaciones:", error);
    return NextResponse.json(
      { error: "Error al eliminar notificación" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

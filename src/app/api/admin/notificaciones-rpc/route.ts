/**
 * API Route - Notificaciones con RPC
 * Endpoints para gestionar notificaciones del sistema
 */

import { NextRequest, NextResponse } from "next/server";
import notificacionesService from "@/lib/services/notificaciones-rpc-service";

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
      const stats =
        await notificacionesService.obtenerEstadisticasNotificaciones(
          Number(usuarioId)
        );
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    // Obtener no leídas
    if (action === "no-leidas") {
      const notificaciones = await notificacionesService.obtenerNoLeidas(
        Number(usuarioId)
      );
      return NextResponse.json({
        success: true,
        data: notificaciones,
        total: notificaciones.length,
      });
    }

    // Obtener con paginación (por defecto)
    const resultado = await notificacionesService.obtenerNotificacionesUsuario(
      Number(usuarioId),
      Number(limit),
      Number(offset)
    );

    return NextResponse.json({
      success: true,
      data: resultado.notificaciones,
      total: resultado.total,
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

    const notificacion = await notificacionesService.crearNotificacionNueva({
      usuarioId: body.usuarioId,
      tipo: body.tipo,
      titulo: body.titulo,
      mensaje: body.mensaje,
      referenciaType: body.referenciaType,
      referenciaId: body.referenciaId,
      urlDestino: body.urlDestino,
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
        await notificacionesService.marcarComoLeida(body.notificacionId);
      } else if (Array.isArray(body.notificacionIds)) {
        await notificacionesService.marcarVariasComoLeidas(
          body.notificacionIds
        );
      }

      return NextResponse.json({
        success: true,
        message: "Notificación(es) marcada(s) como leída(s)",
      });
    }

    if (action === "marcar-todas-leidas") {
      await notificacionesService.marcarTodasComoLeidas(body.usuarioId);
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
      await notificacionesService.eliminarNotificacion(body.notificacionId);
    } else if (Array.isArray(body.notificacionIds)) {
      await notificacionesService.eliminarVariasNotificaciones(
        body.notificacionIds
      );
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

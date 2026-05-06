/**
 * API Route - Auditoría y Operaciones RPC Generales
 * Endpoints para auditoría, cambios de estado y operaciones transversales
 */

import { NextRequest, NextResponse } from "next/server";
import {
  obtenerAuditoriaRegistro,
  obtenerAuditoriaReciente,
} from "@/lib/helpers/rpc-helpers";
import fichasTecnicasService from "@/lib/services/fichas-tecnicas-rpc-service";
import notificacionesService from "@/lib/services/notificaciones-rpc-service";

// ============================================================================
// GET - Obtener auditoría
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const tabla = url.searchParams.get("tabla");
    const registroId = url.searchParams.get("registroId");
    const limit = url.searchParams.get("limit") || "50";

    if (action === "reciente") {
      const auditorias = await obtenerAuditoriaReciente(Number(limit));
      return NextResponse.json({
        success: true,
        data: auditorias,
        total: auditorias.length,
      });
    }

    if (action === "registro" && tabla && registroId) {
      const auditorias = await obtenerAuditoriaRegistro(tabla, Number(registroId));
      return NextResponse.json({
        success: true,
        data: auditorias,
        total: auditorias.length,
      });
    }

    return NextResponse.json(
      { error: "Parámetros inválidos" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error en GET auditoría:", error);
    return NextResponse.json(
      { error: "Error al obtener auditoría" },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Cambios de estado y operaciones
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operacion } = body;

    // Aprobar ficha técnica
    if (operacion === "aprobar-ficha") {
      const fichaActualizada = await fichasTecnicasService.aprobarFichaTecnica(
        body.fichaId,
        body.usuarioId
      );

      return NextResponse.json(
        {
          success: true,
          data: fichaActualizada,
          message: "Ficha técnica aprobada exitosamente",
        },
        { status: 200 }
      );
    }

    // Marcar ficha como obsoleta
    if (operacion === "obsoleta-ficha") {
      const fichaActualizada = await fichasTecnicasService.marcarFichaComObsoleta(
        body.fichaId
      );

      return NextResponse.json(
        {
          success: true,
          data: fichaActualizada,
          message: "Ficha técnica marcada como obsoleta",
        },
        { status: 200 }
      );
    }

    // Notificar eventos
    if (operacion === "notificar-cotizacion-expirada") {
      await notificacionesService.notificarCotizacionExpirada({
        cotizacionId: body.cotizacionId,
        cotizacionNumero: body.cotizacionNumero,
      });

      return NextResponse.json({
        success: true,
        message: "Notificaciones de cotización expirada enviadas",
      });
    }

    if (operacion === "notificar-stock-bajo") {
      await notificacionesService.notificarStockBajo({
        itemId: body.itemId,
        itemNombre: body.itemNombre,
        stockActual: body.stockActual,
        stockMinimo: body.stockMinimo,
        tipoItem: body.tipoItem,
      });

      return NextResponse.json({
        success: true,
        message: "Notificaciones de stock bajo enviadas",
      });
    }

    if (operacion === "notificar-devolucion") {
      await notificacionesService.notificarDevolucionSolicitada({
        devolucionId: body.devolucionId,
        clienteId: body.clienteId,
        productoNombre: body.productoNombre,
      });

      return NextResponse.json({
        success: true,
        message: "Notificaciones de devolución enviadas",
      });
    }

    if (operacion === "notificar-pago-taller") {
      await notificacionesService.notificarPagoPendiente({
        confeccionId: body.confeccionId,
        tallerNombre: body.tallerNombre,
        monto: body.monto,
      });

      return NextResponse.json({
        success: true,
        message: "Notificaciones de pago a taller enviadas",
      });
    }

    if (operacion === "notificar-confeccion-completada") {
      await notificacionesService.notificarConfeccionCompletada({
        confeccionId: body.confeccionId,
        pedidoId: body.pedidoId,
      });

      return NextResponse.json({
        success: true,
        message: "Notificación de confección completada enviada",
      });
    }

    return NextResponse.json(
      { error: "Operación no reconocida" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error en POST operaciones RPC:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: `Error al ejecutar operación: ${message}` },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

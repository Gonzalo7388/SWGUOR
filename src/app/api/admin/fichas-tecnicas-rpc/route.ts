/**
 * API Route - Fichas Técnicas con RPC
 * POST/GET/PUT endpoints para operaciones de fichas técnicas
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fichasTecnicasService from "@/lib/services/fichas-tecnicas-rpc-service";
import { CalcularCostoFichaSchema } from "@/lib/schemas/rpc-schemas";

// ============================================================================
// GET - Obtener ficha con cálculo de costo
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const fichaId = url.searchParams.get("id");

    if (!fichaId || isNaN(Number(fichaId))) {
      return NextResponse.json(
        { error: "ID de ficha inválido" },
        { status: 400 }
      );
    }

    const ficha = await fichasTecnicasService.obtenerFichaTecnica(
      Number(fichaId)
    );

    if (!ficha) {
      return NextResponse.json(
        { error: "Ficha técnica no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ficha,
    });
  } catch (error) {
    console.error("Error en GET fichas técnicas:", error);
    return NextResponse.json(
      { error: "Error al obtener la ficha técnica" },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Crear nueva ficha técnica
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const nuevaFicha = await fichasTecnicasService.crearFichaTecnica({
      productoId: body.productoId,
      version: body.version,
      descripcionDetallada: body.descripcionDetallada,
      imagenGeometral: body.imagenGeometral,
      samTotal: body.samTotal,
      createdBy: body.createdBy,
      detalles: body.detalles,
    });

    return NextResponse.json(
      {
        success: true,
        data: nuevaFicha,
        message: "Ficha técnica creada exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST fichas técnicas:", error);
    return NextResponse.json(
      { error: "Error al crear la ficha técnica" },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Actualizar ficha técnica
// ============================================================================
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const fichaId = url.searchParams.get("id");
    const body = await request.json();

    if (!fichaId || isNaN(Number(fichaId))) {
      return NextResponse.json(
        { error: "ID de ficha inválido" },
        { status: 400 }
      );
    }

    const fichaActualizada = await fichasTecnicasService.actualizarFichaTecnica(
      Number(fichaId),
      {
        version: body.version,
        descripcionDetallada: body.descripcionDetallada,
        estado: body.estado,
        samTotal: body.samTotal,
        detalles: body.detalles,
      }
    );

    return NextResponse.json({
      success: true,
      data: fichaActualizada,
      message: "Ficha técnica actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error en PUT fichas técnicas:", error);
    return NextResponse.json(
      { error: "Error al actualizar la ficha técnica" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

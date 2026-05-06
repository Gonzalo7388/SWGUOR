/**
 * API Route - Inventario y Stock con RPC
 * Endpoints para operaciones de inventario usando RPC
 */

import { NextRequest, NextResponse } from "next/server";
import inventarioService from "@/lib/services/inventario-rpc-service";

// ============================================================================
// GET - Obtener stock
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tipoItem = url.searchParams.get("tipo");
    const itemId = url.searchParams.get("id");
    const action = url.searchParams.get("action");

    // Obtener items con stock bajo
    if (action === "bajo-stock") {
      const almacenId = url.searchParams.get("almacenId");
      const items = await inventarioService.obtenerItemsConStockBajo(
        almacenId ? Number(almacenId) : undefined
      );
      return NextResponse.json({
        success: true,
        data: items,
      });
    }

    if (!itemId || isNaN(Number(itemId))) {
      return NextResponse.json(
        { error: "ID de item inválido" },
        { status: 400 }
      );
    }

    let stock;

    if (tipoItem === "producto") {
      stock = await inventarioService.obtenerStockProducto(Number(itemId));
    } else if (tipoItem === "insumo") {
      stock = await inventarioService.obtenerStockInsumo(Number(itemId));
    } else if (tipoItem === "material") {
      stock = await inventarioService.obtenerStockMaterial(Number(itemId));
    } else {
      return NextResponse.json(
        { error: "Tipo de item inválido" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: stock,
    });
  } catch (error) {
    console.error("Error en GET inventario:", error);
    return NextResponse.json(
      { error: "Error al obtener el stock" },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Registrar movimiento
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, ...datos } = body;

    let movimiento;

    if (tipo === "entrada") {
      movimiento = await inventarioService.registrarEntrada({
        productoId: datos.productoId,
        insumoId: datos.insumoId,
        materialId: datos.materialId,
        almacenId: datos.almacenId,
        cantidad: datos.cantidad,
        motivo: datos.motivo,
        usuarioId: datos.usuarioId,
        costoUnitario: datos.costoUnitario,
        tipoReferencia: datos.tipoReferencia || "COMPRA",
        referenciaId: datos.referenciaId || 0,
      });
    } else if (tipo === "salida") {
      movimiento = await inventarioService.registrarSalida({
        productoId: datos.productoId,
        insumoId: datos.insumoId,
        materialId: datos.materialId,
        almacenId: datos.almacenId,
        cantidad: datos.cantidad,
        motivo: datos.motivo,
        usuarioId: datos.usuarioId,
        tipoReferencia: datos.tipoReferencia || "PRODUCCION",
        referenciaId: datos.referenciaId || 0,
      });
    } else if (tipo === "ajuste") {
      movimiento = await inventarioService.registrarAjuste({
        productoId: datos.productoId,
        insumoId: datos.insumoId,
        materialId: datos.materialId,
        almacenId: datos.almacenId,
        cantidadAnterior: datos.cantidadAnterior,
        cantidadNueva: datos.cantidadNueva,
        motivo: datos.motivo,
        usuarioId: datos.usuarioId,
      });
    } else {
      return NextResponse.json(
        { error: "Tipo de movimiento inválido" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: movimiento,
        message: "Movimiento registrado exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST inventario:", error);
    const message =
      error instanceof Error ? error.message : "Error al registrar movimiento";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ============================================================================
// PUT - Filtrar movimientos
// ============================================================================
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const movimientos = await inventarioService.filtrarMovimientos({
      tipoMovimiento: body.tipoMovimiento,
      referenciaType: body.referenciaType,
      almacenId: body.almacenId,
      fechaInicio: body.fechaInicio ? new Date(body.fechaInicio) : undefined,
      fechaFin: body.fechaFin ? new Date(body.fechaFin) : undefined,
      limit: body.limit || 50,
      offset: body.offset || 0,
    });

    return NextResponse.json({
      success: true,
      data: movimientos,
      total: movimientos.length,
    });
  } catch (error) {
    console.error("Error en PUT inventario:", error);
    return NextResponse.json(
      { error: "Error al filtrar movimientos" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

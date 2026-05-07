/**
 * API Route - Inventario y Stock con RPC
 * Endpoints para operaciones de inventario usando RPC
 */

import { NextRequest, NextResponse } from "next/server";
import {
  obtenerItemsConStockBajo,
  obtenerStockProducto,
  obtenerStockInsumo,
  obtenerStockMaterial,
  registrarMovimiento,
  listarMovimientos,
} from '@/lib/services';

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
      const items = await obtenerItemsConStockBajo(almacenId ? Number(almacenId) : undefined);
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
      stock = await obtenerStockProducto(Number(itemId));
    } else if (tipoItem === "insumo") {
      stock = await obtenerStockInsumo(Number(itemId));
    } else if (tipoItem === "material") {
      stock = await obtenerStockMaterial(Number(itemId));
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
      movimiento = await registrarMovimiento({
        tipoMovimiento: 'entrada',
        referenciaType: datos.tipoReferencia || 'COMPRA',
        referenciaId: datos.referenciaId ? Number(datos.referenciaId) : 0,
        cantidad: Number(datos.cantidad),
        motivo: datos.motivo ?? '',
        productoId: datos.productoId ? Number(datos.productoId) : undefined,
        insumoId: datos.insumoId ? Number(datos.insumoId) : undefined,
        materialId: datos.materialId ? Number(datos.materialId) : undefined,
        usuarioId: datos.usuarioId ? Number(datos.usuarioId) : undefined,
        almacenId: datos.almacenId ? Number(datos.almacenId) : undefined,
        costoUnitario: datos.costoUnitario ? Number(datos.costoUnitario) : undefined,
      } as any);
    } else if (tipo === "salida") {
      movimiento = await registrarMovimiento({
        tipoMovimiento: 'salida',
        referenciaType: datos.tipoReferencia || 'PRODUCCION',
        referenciaId: datos.referenciaId ? Number(datos.referenciaId) : 0,
        cantidad: Number(datos.cantidad),
        motivo: datos.motivo ?? '',
        productoId: datos.productoId ? Number(datos.productoId) : undefined,
        insumoId: datos.insumoId ? Number(datos.insumoId) : undefined,
        materialId: datos.materialId ? Number(datos.materialId) : undefined,
        usuarioId: datos.usuarioId ? Number(datos.usuarioId) : undefined,
        almacenId: datos.almacenId ? Number(datos.almacenId) : undefined,
      } as any);
    } else if (tipo === "ajuste") {
      movimiento = await registrarMovimiento({
        tipoMovimiento: 'ajuste',
        referenciaType: 'AJUSTE',
        referenciaId: datos.referenciaId ? Number(datos.referenciaId) : 0,
        cantidad: Number(datos.cantidadNueva ?? datos.cantidad ?? 0),
        motivo: datos.motivo ?? '',
        productoId: datos.productoId ? Number(datos.productoId) : undefined,
        insumoId: datos.insumoId ? Number(datos.insumoId) : undefined,
        materialId: datos.materialId ? Number(datos.materialId) : undefined,
        usuarioId: datos.usuarioId ? Number(datos.usuarioId) : undefined,
        almacenId: datos.almacenId ? Number(datos.almacenId) : undefined,
      } as any);
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

    const movimientos = await listarMovimientos({
      tipo_movimiento: body.tipoMovimiento,
      referencia_tipo: body.referenciaType,
      almacen_id: body.almacenId,
      desde: body.fechaInicio ? new Date(body.fechaInicio) : undefined,
      hasta: body.fechaFin ? new Date(body.fechaFin) : undefined,
      limite: body.limit || 50,
      producto_id: body.productoId,
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

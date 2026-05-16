export const runtime = 'nodejs';
import { ConfeccionesService } from "@/lib/services/confecciones.service";
import { NextResponse } from "next/server";

// GET /api/admin/confecciones/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const confeccion = await ConfeccionesService.obtenerPorId(id);

    if (!confeccion) {
      return NextResponse.json(
        { error: 'Confección no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(confeccion);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/confecciones/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // El usuario_id suele venir de la sesión o de un header en el middleware
    const usuario_id = request.headers.get('x-user-id') || undefined;

    if (!body.estado) {
      return NextResponse.json(
        { error: 'estado requerido' },
        { status: 400 }
      );
    }

    const resultado = await ConfeccionesService.actualizarEstado(
      id,
      body.estado,
      usuario_id
    );

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error en la actualización' },
      { status: 500 }
    );
  }
}
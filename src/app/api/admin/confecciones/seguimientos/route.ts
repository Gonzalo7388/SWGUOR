export const runtime = 'nodejs';
import { ConfeccionesService } from "@/lib/services/confecciones-services";
import { NextResponse } from "next/server";

export async function POST(
  req: Request, 
  { params }: { params: Promise<any> }
) {
  try {
    const body = await req.json();

    // Validaciones básicas
    if (!body.confeccion_id || !body.estado_nuevo) {
      return NextResponse.json(
        { error: 'confeccion_id y estado_nuevo requeridos' }, 
        { status: 400 }
      );
    }

    /**
     * IMPORTANTE: 'usuario_id' no puede ser un argumento de la función POST.
     * Debe venir en el body del JSON o extraerse de la sesión/headers.
     */
    const usuario_id = body.usuario_id; 

    if (!usuario_id) {
      return NextResponse.json(
        { error: 'usuario_id es requerido para registrar el seguimiento' }, 
        { status: 400 }
      );
    }

    // Llamada al servicio con los datos corregidos
    const seg = await ConfeccionesService.registrarSeguimiento({ 
      ...body, 
      usuario_id 
    });

    return NextResponse.json(
      { success: true, data: seg }, 
      { status: 201 }
    );

  } catch (error: any) {
    console.error("[API_SEGUIMIENTOS] Error:", error);
    return NextResponse.json(
      { error: error.message || 'Error interno' }, 
      { status: 500 }
    );
  }
}
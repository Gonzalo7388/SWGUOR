export const runtime = 'nodejs';
import { OrdenesProduccionService } from '@/lib/services/ordenes-produccion.service';
import { NextResponse } from 'next/server';

// POST /api/admin/ordenes-produccion/etapa
// CORREGIDO: el segundo parámetro no puede ser usuario_id: string.
// En App Router, los handlers reciben (req: Request, { params }) — nada más.
// usuario_id debe venir en el body o extraerse de la sesión/auth.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orden_id, etapa, usuario_id, ...rest } = body;

    if (!orden_id) {
      return NextResponse.json({ error: 'orden_id requerido' }, { status: 400 });
    }
    if (!etapa) {
      return NextResponse.json({ error: 'etapa requerida' }, { status: 400 });
    }

    // El servicio detecta si etapa === 'almacen' y dispara:
    // +Stock -> Producto 'activo' -> Orden 'completada'
    const seg = await OrdenesProduccionService.registrarEtapa({
      orden_id,
      etapa,
      usuario_id: usuario_id ?? null, // Idealmente extraer de sesión: getServerSession(req)
      ...rest,
    });

    return NextResponse.json({ success: true, data: seg }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /ordenes-produccion/etapa]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
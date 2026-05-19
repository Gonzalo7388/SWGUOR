export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';

const SEGUIMIENTO_CONFECCION_ROLES: RolUsuario[] = ['administrador', 'gerente', 'disenador', 'cortador', 'representante_taller', 'ayudante'];

// ── GET: Seguimientos por confección ─────────────────────────────────────
export async function GET(req: Request) {
  const auth = await requireServerRole(SEGUIMIENTO_CONFECCION_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const confeccion_id = searchParams.get('confeccion_id');

    if (!confeccion_id) {
      return NextResponse.json({ error: 'confeccion_id requerido' }, { status: 400 });
    }

    const seguimientos = await prisma.seguimiento_confeccion.findMany({
      where: { confeccion_id: BigInt(confeccion_id) },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ success: true, data: serializeBigInt(seguimientos) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── POST: Registrar cambio de estado (Corregido) ─────────────────────────────────────
export async function POST(req: Request) {
  const auth = await requireServerRole(SEGUIMIENTO_CONFECCION_ROLES);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { confeccion_id, estado_anterior, estado_nuevo, notas } = body;

    // Validación estricta de campos
    if (!confeccion_id || !estado_nuevo) {
      return NextResponse.json({ error: 'Faltan datos obligatorios (ID o Estado)' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verificar que la confección exista antes de operar
      const confeccionExiste = await tx.confecciones.findUnique({
        where: { id: BigInt(confeccion_id) }
      });

      if (!confeccionExiste) {
        throw new Error("La orden de confección no existe");
      }

      // 2. Registrar en historial de seguimiento
      const seg = await tx.seguimiento_confeccion.create({
        data: {
          confeccion_id:   BigInt(confeccion_id),
          estado_anterior: estado_anterior || null,
          estado_nuevo:    estado_nuevo,
          notas:           notas || null,
          // Convertimos el ID del responsable a BigInt por seguridad
          responsable_id:  BigInt(auth.user.id), 
        },
      });

      // 3. Actualizar la tabla maestra de confecciones
      await tx.confecciones.update({
        where: { id: BigInt(confeccion_id) },
        data:  { 
          estado: estado_nuevo, 
          updated_at: new Date() 
        },
      });

      return seg;
    });

    return NextResponse.json({ success: true, data: serializeBigInt(result) }, { status: 201 });
  } catch (error: any) {
    console.error("Error en seguimiento:", error.message);
    return NextResponse.json({ 
      error: error.message || "Error interno al procesar el seguimiento" 
    }, { status: 500 });
  }
}
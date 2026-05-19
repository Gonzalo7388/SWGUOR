import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { crearAlmacenSchema as almacenSchema } from '@/lib/schemas/almacenesSchema';
import { ZodError } from 'zod';
import { requireServerRole } from '@/lib/auth/server';
import { auditoriaService } from '@/lib/services/auditoria.service';

const ALMACEN_ROLES: any = ['administrador', 'gerente', 'almacenero'];

export async function GET(request: NextRequest) {
  const auth = await requireServerRole(ALMACEN_ROLES);
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const almacenes = await prisma.almacenes.findMany({
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(almacenes);
  } catch (error) {
    console.error('Error fetching almacenes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireServerRole(ALMACEN_ROLES);
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const validated = almacenSchema.parse(body);

    const almacen = await prisma.almacenes.create({
      data: validated,
    });

    await auditoriaService.registrar({
      usuario_id: BigInt(auth.user.id),
      accion: 'CREAR',
      tabla: 'almacenes',
      registro_id: BigInt(almacen.id),
      datos_despues: almacen,
    });

    return NextResponse.json(almacen, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    console.error('Error creating almacen:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
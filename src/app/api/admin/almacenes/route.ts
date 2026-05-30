import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { crearAlmacenSchema as almacenSchema } from '@/lib/schemas/almacenes';
import { ZodError } from 'zod';
import { requireServerRole } from '@/lib/auth/server';
import { auditoriaService } from '@/lib/services/auditoria.service';
import { RolUsuario } from '@/lib/constants/roles';

const ALMACEN_ROLES: RolUsuario[] = ['administrador', 'gerente', 'almacenero', 'representante_taller'];

// Función utilitaria local para serializar bigints y decimales de forma segura antes de viajar por JSON o Auditorías
const serializarPrisma = (objeto: any) => {
  return JSON.parse(
    JSON.stringify(objeto, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
};

export async function GET(request: NextRequest) {
  const auth = await requireServerRole(ALMACEN_ROLES);
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const almacenes = await prisma.almacenes.findMany({
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(serializarPrisma(almacenes));
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
      data: {
        nombre: validated.nombre,
        direccion: validated.direccion,
        telefono: validated.telefono,
        email: validated.email,
        descripcion: validated.descripcion,
        unidad_capacidad: validated.unidad_capacidad || 'unidades',
        capacidad_total: validated.capacidad_total,
        estado: String(validated.estado).toLowerCase() === 'true',
        responsable_id: validated.responsable_id ? BigInt(validated.responsable_id) : null,
      },
    });

    // CORRECCIÓN DEL ERROR TS 2322: Serializamos el objeto para transformar 'bigint' y 'Decimal' a tipos JSON válidos
    const almacenSerializado = serializarPrisma(almacen);

    await auditoriaService.registrar({
      usuario_id: BigInt(auth.user.id),
      accion: 'CREAR',
      tabla: 'almacenes',
      registro_id: BigInt(almacen.id),
      datos_despues: almacenSerializado, // <-- Ahora es un objeto JSON plano totalmente compatible
    });

    return NextResponse.json(almacenSerializado, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    console.error('Error creating almacen:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
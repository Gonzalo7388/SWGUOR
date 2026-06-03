export const runtime = 'nodejs';
import { OrdenesProduccionService } from '@/lib/services/ordenes-produccion.service';
import { NextResponse } from 'next/server';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';

const ROLES_LECTURA = ['administrador', 'gerente', 'representante_taller', 'recepcionista', 'disenador'] as RolUsuario[];

export async function GET(req: Request) {
  const auth = await requireServerRole(ROLES_LECTURA);
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(req.url);

    // 1. Helper reutilizable para desinfectar strings y evitar inyecciones corruptas de Enums o IDs
    const desinfectarParametro = (val: string | null): string | undefined => {
      if (!val || val === 'all' || val === 'todos' || val === 'undefined' || val === 'null' || val.trim() === '') {
        return undefined;
      }
      return val.trim();
    };

    // 2. Extraer y limpiar parámetros de búsqueda y filtros relacionales
    const producto_id = desinfectarParametro(searchParams.get('producto_id'));
    const taller_id = desinfectarParametro(searchParams.get('taller_id'));
    const search = desinfectarParametro(searchParams.get('search'));

    // 3. Capturar de manera cruzada filtros operativos (etapa vs estado)
    // El Front-End suele llamarle "etapa" o "estado" indiferentemente a los selectores de arriba.
    const estado = desinfectarParametro(searchParams.get('estado'));
    const etapa = desinfectarParametro(searchParams.get('etapa'));

    // 4. Saneamiento estricto de paginación contra NaNs
    const rawPage = searchParams.get('page');
    const rawLimit = searchParams.get('limit');

    const page = rawPage && !isNaN(Number(rawPage)) ? Math.max(1, Number(rawPage)) : 1;
    const limit = rawLimit && !isNaN(Number(rawLimit)) ? Math.max(1, Number(rawLimit)) : 10;

    // 5. Consumir el Servicio usando parámetros limpios o undefined (Evita romper los Enums de Prisma)
    const result = await OrdenesProduccionService.listar({
      producto_id,
      taller_id,
      estado, // Si es undefined, el servicio no inyectará la regla strict string al enum nativo
      etapa,  // Pasa limpio como string | undefined resolviendo el sub-where
      search,
      page,
      limit,
    });

    // 6. Formatear la salida idéntica a lo que espera tu hook useOrdenesProduccion en Front
    return NextResponse.json({
      success: true,
      ordenes: result?.data || [],
      meta: result?.meta || { total: 0, totalPages: 1, page, limit }
    });

  } catch (error: any) {
    console.error('[GET /ordenes-produccion] Error Crítico:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
import { prisma }          from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import type { Cargo } from '@prisma/client';

export const PersonalInternoService = {

  // ── Listar ──────────────────────────────────────────────────
  async listar(params?: { cargo?: string; estado?: string; busqueda?: string }) {
    const where: any = {};
    if (params?.cargo)  where.cargo  = params.cargo;
    if (params?.estado !== undefined && params.estado !== '') {
      where.estado = params.estado === 'activo';
    }
    if (params?.busqueda) {
      where.OR = [
        { nombre_completo: { contains: params.busqueda, mode: 'insensitive' } },
        { usuarios: { email: { contains: params.busqueda, mode: 'insensitive' } } },
      ];
    }

    const personal = await prisma.personal_interno.findMany({
      where,
      include: {
        usuarios: {
          select: { id: true, email: true, estado: true, rol: true, ultimo_acceso: true },
        },
      },
      orderBy: { nombre_completo: 'asc' },
    });
    return serializeBigInt(personal);
  },

  // ── Obtener por ID ──────────────────────────────────────────
  async obtenerPorId(id: string) {
    const persona = await prisma.personal_interno.findUnique({
      where:   { id: BigInt(id) },
      include: { usuarios: { select: { id: true, email: true, estado: true, rol: true } } },
    });
    return persona ? serializeBigInt(persona) : null;
  },

  // ── Obtener por usuario_id ──────────────────────────────────
  async obtenerPorUsuarioId(usuarioId: string) {
    const persona = await prisma.personal_interno.findFirst({
      where:   { usuario_id: BigInt(usuarioId) },
      include: { usuarios: { select: { id: true, email: true, estado: true, rol: true } } },
    });
    return persona ? serializeBigInt(persona) : null;
  },

  // ── Actualizar ──────────────────────────────────────────────
  async actualizar(id: string, data: Partial<{
    nombre_completo: string;
    cargo:           string;
    dni:             number;
    telefono:        number;
    fecha_ingreso:   string;
    estado:          boolean;
  }>) {
    const { dni, telefono, fecha_ingreso, cargo, ...rest } = data as any;
    const persona = await prisma.personal_interno.update({
      where: { id: BigInt(id) },
      data:  {
        ...rest,
        ...(cargo         !== undefined && { cargo:         cargo as Cargo }),
        ...(dni           !== undefined && { dni:           BigInt(dni)          }),
        ...(telefono      !== undefined && { telefono:      BigInt(telefono)     }),
        ...(fecha_ingreso !== undefined && { fecha_ingreso: new Date(fecha_ingreso) }),
        updated_at: new Date(),
      },
    });
    return serializeBigInt(persona);
  },

  // ── Actualizar por usuario_id ───────────────────────────────
  async actualizarPorUsuarioId(usuarioId: string, data: Partial<{
    nombre_completo: string;
    cargo:           string;
    dni:             number;
    telefono:        number;
    fecha_ingreso:   string;
    estado:          boolean;
  }>) {
    const persona = await prisma.personal_interno.findFirst({
      where: { usuario_id: BigInt(usuarioId) },
    });
    if (!persona) throw new Error('Personal no encontrado para este usuario');
    return this.actualizar(persona.id.toString(), data);
  },
};
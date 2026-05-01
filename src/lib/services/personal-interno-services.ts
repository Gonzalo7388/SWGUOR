import { prisma }          from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { createClient }    from '@/lib/supabase/server';
import type { Cargo, EstadoPersonal, EstadoUsuario } from '@prisma/client';

export interface PersonalRow {
  id:              string;
  nombre_completo: string | null;
  cargo:           string | null;
  dni:             string | null;
  telefono:        string | null;
  estado:          EstadoPersonal | null;
  fecha_ingreso:   string | null;
  usuarios?: {
    id:            string;
    email:         string;
    estado:        string;
    rol:           string | null;
    ultimo_acceso: string | null;
  } | null;
}

export const PersonalInternoService = {

  // ── Listar ──────────────────────────────────────────────────
  async listar(params?: { cargo?: string; estado?: string; busqueda?: string }) {
    const where: any = {};

    if (params?.cargo) {
      where.cargo = params.cargo;
    }

    if (params?.estado && params.estado !== '') {
      where.estado = params.estado as EstadoPersonal;
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
    const personal = await prisma.personal_interno.findUnique({
      where:   { id: BigInt(id) },
      include: { usuarios: { select: { id: true, email: true, estado: true, rol: true } } },
    });
    return personal ? serializeBigInt(personal) : null;
  },

  // ── Obtener por usuario_id ──────────────────────────────────
  async obtenerPorUsuarioId(usuarioId: string) {
    const personal = await prisma.personal_interno.findFirst({
      where:   { usuario_id: BigInt(usuarioId) },
      include: { usuarios: { select: { id: true, email: true, estado: true, rol: true } } },
    });
    return personal ? serializeBigInt(personal) : null;
  },

  // ── Actualizar datos del colaborador ────────────────────────
  async actualizar(id: string, data: Partial<{
    nombre_completo: string;
    cargo:           string;
    dni:             number;
    telefono:        number;
    fecha_ingreso:   string;
  }>) {
    const { dni, telefono, fecha_ingreso, cargo, ...rest } = data as any;

    const personal = await prisma.personal_interno.update({
      where: { id: BigInt(id) },
      data: {
        ...rest,
        ...(cargo         !== undefined && { cargo:         cargo as Cargo           }),
        ...(dni           !== undefined && { dni:           BigInt(dni)              }),
        ...(telefono      !== undefined && { telefono:      BigInt(telefono)         }),
        ...(fecha_ingreso !== undefined && { fecha_ingreso: new Date(fecha_ingreso)  }),
        updated_at: new Date(),
      },
    });

    return serializeBigInt(personal);
  },

  // ── Actualizar por usuario_id ───────────────────────────────
  async actualizarPorUsuarioId(usuarioId: string, data: Partial<{
    nombre_completo: string;
    cargo:           string;
    dni:             number;
    telefono:        number;
    fecha_ingreso:   string;
  }>) {
    const personal = await prisma.personal_interno.findFirst({
      where: { usuario_id: BigInt(usuarioId) },
    });
    if (!personal) throw new Error('Personal no encontrado para este usuario');
    return this.actualizar(personal.id.toString(), data);
  },

  // ── FLUJO: Toggle estado (suspender / reactivar) ────────────
  // Sincroniza las 3 capas en orden:
  //   1. personal_interno.estado  → EstadoPersonal ('activo' | 'inactivo' | 'suspendido')
  //   2. usuarios.estado          → EstadoUsuario  ('activo' | 'inactivo')
  //   3. Supabase Auth ban        → ban_duration
  async toggleEstado(personalId: string, suspender: boolean) {
    const supabase = await createClient();

    const personal = await prisma.personal_interno.findUnique({
      where:   { id: BigInt(personalId) },
      include: { usuarios: { select: { id: true, auth_id: true } } },
    });

    if (!personal) throw new Error('Personal no encontrado');

    const nuevoEstadoPersonal: EstadoPersonal = suspender ? 'inactivo' : 'activo';
    const nuevoEstadoUsuario:  EstadoUsuario  = suspender ? 'inactivo' : 'activo';

    // Actualizar ambas tablas en transacción atómica
    await prisma.$transaction(async (tx) => {

      await tx.personal_interno.update({
        where: { id: BigInt(personalId) },
        data:  { estado: nuevoEstadoPersonal, updated_at: new Date() },
      });

      if (personal.usuarios) {
        await tx.usuarios.update({
          where: { id: personal.usuarios.id },
          data:  { estado: nuevoEstadoUsuario, updated_at: new Date() },
        });
      }
    });

    // Sincronizar ban en Supabase Auth (fuera de la tx — API externa)
    if (personal.usuarios?.auth_id) {
      const { error } = await supabase.auth.admin.updateUserById(
        personal.usuarios.auth_id,
        { ban_duration: suspender ? '87600h' : 'none' }
      );

      if (error) {
        console.error(
          `[PersonalInternoService.toggleEstado] Error al ${suspender ? 'banear' : 'desbanear'} Auth user ${personal.usuarios.auth_id}:`,
          error.message
        );
      }
    }

    return {
      personalId,
      suspendido:     suspender,
      estadoPersonal: nuevoEstadoPersonal,
      estadoUsuario:  nuevoEstadoUsuario,
    };
  },

  // ── FLUJO: Suspender por el sistema (automático) ─────────────
  // Usa 'suspendido' del enum — distinto de 'inactivo' (baja manual por admin)
  // Reservado para bloqueos automáticos: intentos fallidos, violaciones de política, etc.
  async suspenderPorSistema(personalId: string, motivo?: string) {
    const supabase = await createClient();

    const personal = await prisma.personal_interno.findUnique({
      where:   { id: BigInt(personalId) },
      include: { usuarios: { select: { id: true, auth_id: true } } },
    });

    if (!personal) throw new Error('Personal no encontrado');

    await prisma.$transaction(async (tx) => {
      await tx.personal_interno.update({
        where: { id: BigInt(personalId) },
        data:  { estado: 'suspendido' as EstadoPersonal, updated_at: new Date() },
      });

      if (personal.usuarios) {
        await tx.usuarios.update({
          where: { id: personal.usuarios.id },
          data:  { estado: 'inactivo' as EstadoUsuario, updated_at: new Date() },
        });
      }
    });

    if (personal.usuarios?.auth_id) {
      const { error } = await supabase.auth.admin.updateUserById(
        personal.usuarios.auth_id,
        { ban_duration: '87600h' }
      );
      if (error) {
        console.error(
          `[PersonalInternoService.suspenderPorSistema] Error Auth ban ${personal.usuarios.auth_id}:`,
          error.message
        );
      }
    }

    if (motivo) {
      console.warn(`[PersonalInternoService.suspenderPorSistema] personalId=${personalId} motivo="${motivo}"`);
    }

    return { personalId, estado: 'suspendido' as EstadoPersonal, motivo };
  },
};
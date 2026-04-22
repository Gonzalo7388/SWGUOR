// lib/services/usuarios-service.ts
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { createClient } from '@/lib/supabase/server';
import type { Rol, EstadoUsuario } from '@prisma/client';

// ─────────────────────────────────────────────────────────────
//  Tipos
// ─────────────────────────────────────────────────────────────
export interface UsuarioConRelaciones {
  id: string;
  email: string;
  estado: string;
  rol: string | null;
  ultimo_acceso: string | null;
  created_at: string;
  auth_id: string | null;

  personal_interno?: {
    nombre_completo: string | null;
    cargo: string | null;
    dni: string | null;
    ficha_ingres: string | null;
  } | null;

  clientes?: {
    id: string;
    ruc: string;
    razon_social: string | null;
    activo: string;
  } | null;
}

export interface CrearUsuarioInput {
  // Acceso al sistema
  email: string;
  password: string;
  rol: string;
  // Datos personales
  nombre_completo: string;
  dni?: number;
  cargo: string;
  telefono?: number;
  fecha_ingreso?: string; // 'YYYY-MM-DD'
}

export interface ActualizarUsuarioInput {
  rol?: string;
  estado?: string;
  personal?: {
    nombre_completo?: string;
    dni?: number;
    cargo?: string;
    telefono?: number;
    fecha_ingreso?: string;
    estado?: boolean;
  };
}

// ─────────────────────────────────────────────────────────────
//  Servicio
// ─────────────────────────────────────────────────────────────
export const UsuariosService = {

  // ── Listar todos ────────────────────────────────────────────
  async listar() {
    const usuarios = await prisma.usuarios.findMany({
      include: {
        personal_interno: {
          select: {
            id: true,
            nombre_completo: true,
            cargo: true,
            dni: true,
            telefono: true,
            estado: true,
          },
        },
        clientes: {
          select: {
            id: true,
            razon_social: true,
            ruc: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    return serializeBigInt(usuarios);
  },

  // ── Obtener uno por id ──────────────────────────────────────
  async obtenerPorId(id: string) {
    const usuario = await prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
      include: {
        personal_interno: true,
        clientes: {
          include: {
            direcciones_cliente: true,
            feedback_cliente: {
              orderBy: { enviado_en: 'desc' },
              take: 5,
            },
          },
        },
      },
    });
    return usuario ? serializeBigInt(usuario) : null;
  },

  // ── FLUJO 1: Crear usuario ──────────────────────────────────
  // Auth → usuarios → personal_interno
  // Si falla la BD hace rollback eliminando el usuario de Auth
  async crear(input: CrearUsuarioInput) {
    const {
      email, password, rol,
      nombre_completo, dni, cargo, telefono, fecha_ingreso,
    } = input;

    const supabase = await createClient();

    // PASO 1: Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message ?? 'Error al crear usuario en Supabase Auth');
    }

    const auth_id = authData.user.id;

    try {
      // PASO 2 + 3: Crear usuarios y personal_interno en una transacción atómica
      const resultado = await prisma.$transaction(async (tx) => {
        // Tabla usuarios
        const usuario = await tx.usuarios.create({
          data: {
            email,
            rol: rol as Rol,
            estado: 'activo' as EstadoUsuario,
            auth_id,
          },
        });

        // Tabla personal_interno
        await tx.personal_interno.create({
          data: {
            usuario_id: usuario.id,
            nombre_completo,
            dni: dni ? BigInt(dni) : null,
            cargo: cargo as any,
            telefono: telefono ? BigInt(telefono) : null,
            fecha_ingreso: fecha_ingreso ? new Date(fecha_ingreso) : null,
            estado: true,
          },
        });

        // Retornar usuario con relaciones
        return tx.usuarios.findUnique({
          where: { id: usuario.id },
          include: { personal_interno: true, clientes: true },
        });
      });

      return resultado ? serializeBigInt(resultado) : null;

    } catch (dbError) {
      // ROLLBACK: Si falla la BD, eliminar el usuario creado en Auth
      await supabase.auth.admin.deleteUser(auth_id);
      throw dbError;
    }
  },

  // ── Actualizar usuario + personal_interno ───────────────────
  async actualizar(id: string, input: ActualizarUsuarioInput) {
    const { rol, estado, personal } = input;

    const resultado = await prisma.$transaction(async (tx) => {
      // Actualizar tabla usuarios
      const usuario = await tx.usuarios.update({
        where: { id: BigInt(id) },
        data: {
          ...(rol !== undefined    && { rol: rol as Rol }),
          ...(estado !== undefined && { estado: estado as EstadoUsuario }),
          updated_at: new Date(),
        },
      });

      // Actualizar personal_interno si hay campos
      if (personal) {
        const personalExistente = await tx.personal_interno.findFirst({
          where: { usuario_id: BigInt(id) },
        });

        if (personalExistente) {
          await tx.personal_interno.update({
            where: { id: personalExistente.id },
            data: {
              ...(personal.nombre_completo !== undefined && { nombre_completo: personal.nombre_completo }),
              ...(personal.cargo !== undefined           && { cargo: personal.cargo as any }),
              ...(personal.dni !== undefined             && { dni: BigInt(personal.dni) }),
              ...(personal.telefono !== undefined        && { telefono: BigInt(personal.telefono) }),
              ...(personal.fecha_ingreso !== undefined   && { fecha_ingreso: new Date(personal.fecha_ingreso) }),
              ...(personal.estado !== undefined          && { estado: personal.estado }),
              updated_at: new Date(),
            },
          });
        }
      }

      return usuario;
    });

    return serializeBigInt(resultado);
  },

  // ── FLUJO 2: Toggle estado activo/inactivo ──────────────────
  // Cambia el estado en BD Y banea/desbanea en Supabase Auth
  // para que el usuario realmente no pueda iniciar sesión
  async toggleEstado(id: string, estado: EstadoUsuario) {
    const supabase = await createClient();

    // Obtener auth_id del usuario
    const usuarioActual = await prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
      select: { auth_id: true },
    });

    if (!usuarioActual) throw new Error('Usuario no encontrado');

    // Sincronizar ban en Supabase Auth
    if (usuarioActual.auth_id) {
      await supabase.auth.admin.updateUserById(usuarioActual.auth_id, {
        // 87600h ≈ 10 años = efectivamente bloqueado
        // 'none' = desbloquear
        ban_duration: estado === 'inactivo' ? '87600h' : 'none',
      });
    }

    // Actualizar estado en BD
    const usuario = await prisma.usuarios.update({
      where: { id: BigInt(id) },
      data: { estado, updated_at: new Date() },
    });

    return serializeBigInt(usuario);
  },

  // ── FLUJO 3: Eliminar usuario ───────────────────────────────
  // Respeta las FK: personal_interno → usuarios → Auth
  async eliminar(id: string) {
    const supabase = await createClient();

    const usuario = await prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
      select: { auth_id: true },
    });

    if (!usuario) throw new Error('Usuario no encontrado');

    // PASO 1: Eliminar personal_interno (FK → usuarios)
    await prisma.personal_interno.deleteMany({
      where: { usuario_id: BigInt(id) },
    });

    // PASO 2: Eliminar de tabla usuarios
    await prisma.usuarios.delete({ where: { id: BigInt(id) } });

    // PASO 3: Eliminar de Supabase Auth
    if (usuario.auth_id) {
      const { error } = await supabase.auth.admin.deleteUser(usuario.auth_id);
      if (error) {
        // Log sin lanzar: el registro de BD ya fue eliminado correctamente
        console.error(`[UsuariosService.eliminar] Error al eliminar Auth user ${usuario.auth_id}:`, error.message);
      }
    }

    return { success: true };
  },
};
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { createAdminClient } from '@/lib/supabase/admin';
import { Rol, EstadoUsuario } from '@prisma/client';

export interface CrearUsuarioInput {
  email: string;
  password: string;
  rol: string;
  createdBy?: string;
}

export interface ActualizarUsuarioInput {
  rol?: string;
  estado?: string;
}

export const UsuariosService = {

  // ── Listar ─────────────────────────────────────────────────
  async listar() {
    const usuarios = await prisma.usuarios.findMany({
      orderBy: { created_at: 'desc' },
    });
    return serializeBigInt(usuarios);
  },

  // ── Obtener uno por id ──────────────────────────────────────
  async obtenerPorId(id: string) {
    const usuario = await prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
    });
    return usuario ? serializeBigInt(usuario) : null;
  },

  // ── Crear usuario ───────────────────────────────────────────
  async crear(input: CrearUsuarioInput) {
    const { email, password, rol, createdBy } = input;
    const supabase = createAdminClient();

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
      const usuario = await prisma.usuarios.create({
        data: {
          email,
          rol: rol as Rol,
          estado: 'activo' as EstadoUsuario,
          auth_id,
          created_by: createdBy ?? null,
        },
      });

      return serializeBigInt(usuario);

    } catch (dbError) {
      await supabase.auth.admin.deleteUser(auth_id);
      throw dbError;
    }
  },

  // ── Actualizar usuario ──────────────────────────────────────
  async actualizar(id: string, input: ActualizarUsuarioInput) {
    const { rol, estado } = input;

    const usuario = await prisma.usuarios.update({
      where: { id: BigInt(id) },
      data: {
        ...(rol !== undefined && { rol: rol as Rol }),
        ...(estado !== undefined && { estado: estado as EstadoUsuario }),
        updated_at: new Date(),
      },
    });

    return serializeBigInt(usuario);
  },

  // ── Cambiar estado de acceso ────────────────────────────────
  async cambiarEstado(id: string, estado: EstadoUsuario) {
    const supabase = createAdminClient();

    const usuarioActual = await prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
      select: { auth_id: true },
    });

    if (!usuarioActual) throw new Error('Usuario no encontrado');

    // Sincronizar el bloqueo en Supabase Auth
    if (usuarioActual.auth_id) {
      await supabase.auth.admin.updateUserById(usuarioActual.auth_id, {
        ban_duration: estado === 'activo' ? 'none' : '876000h',
      });
    }

    const usuario = await prisma.usuarios.update({
      where: { id: BigInt(id) },
      data: { estado, updated_at: new Date() },
    });

    return serializeBigInt(usuario);
  },
};
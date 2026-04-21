import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { createClient } from '@/lib/supabase/server';
import type { Rol, EstadoUsuario } from '@prisma/client';

export const UsuariosService = {
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
        // AÑADIDO: Info básica del cliente vinculado para la tabla
        clientes: {
          select: {
            id: true,
            razon_social: true,
            ruc: true,
          }
        }
      },
      orderBy: { created_at: 'desc' },
    });
    return serializeBigInt(usuarios);
  },

  async obtenerPorId(id: string) {
    const usuario = await prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
      include: {
        personal_interno: true,
        // AÑADIDO: Info detallada del cliente para la página de detalle
        clientes: {
          include: {
            direcciones_cliente: true,
            feedback_cliente: {
              orderBy: { enviado_en: 'desc' },
              take: 5,
            },
          }
        },
      },
    });
    return usuario ? serializeBigInt(usuario) : null;
  },

  async crear(data: {
    email: string;
    password: string;
    rol: string;
    estado?: string;
    personal?: {
      dni: number;
      nombre_completo: string;
      cargo: string;
      telefono?: number;
      fecha_ingreso?: string;
    };
  }) {
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message ?? 'Error al crear usuario en Auth');
    }

    return prisma.$transaction(async (tx) => {
      const usuario = await tx.usuarios.create({
        data: {
          email: data.email,
          rol: data.rol as Rol,
          estado: (data.estado as EstadoUsuario) ?? 'activo',
          auth_id: authData.user.id,
          created_by: authData.user.id,
        },
      });

      if (data.personal) {
        await tx.personal_interno.create({
          data: {
            usuario_id: usuario.id,
            dni: BigInt(data.personal.dni),
            nombre_completo: data.personal.nombre_completo,
            cargo: data.personal.cargo as any,
            telefono: data.personal.telefono ? BigInt(data.personal.telefono) : null,
            fecha_ingreso: data.personal.fecha_ingreso ? new Date(data.personal.fecha_ingreso) : null,
            estado: true,
          },
        });
      }

      return serializeBigInt(usuario);
    });
  },

  async actualizar(id: string, data: {
    rol?: string;
    estado?: string;
    personal?: {
      dni?: number;
      nombre_completo?: string;
      cargo?: string;
      telefono?: number;
      fecha_ingreso?: string;
      estado?: boolean;
    };
  }) {
    return prisma.$transaction(async (tx) => {
      const usuario = await tx.usuarios.update({
        where: { id: BigInt(id) },
        data: {
          ...(data.rol !== undefined && { rol: data.rol as Rol }),
          ...(data.estado !== undefined && { estado: data.estado as EstadoUsuario }),
          updated_at: new Date(),
        },
      });

      if (data.personal) {
        const personal = await tx.personal_interno.findFirst({
          where: { usuario_id: BigInt(id) },
        });

        if (personal) {
          await tx.personal_interno.update({
            where: { id: personal.id },
            data: {
              ...(data.personal.nombre_completo !== undefined && { nombre_completo: data.personal.nombre_completo }),
              ...(data.personal.cargo !== undefined && { cargo: data.personal.cargo as any }),
              ...(data.personal.dni !== undefined && { dni: BigInt(data.personal.dni) }),
              ...(data.personal.telefono !== undefined && { telefono: BigInt(data.personal.telefono) }),
              ...(data.personal.fecha_ingreso !== undefined && { fecha_ingreso: new Date(data.personal.fecha_ingreso) }),
              ...(data.personal.estado !== undefined && { estado: data.personal.estado }),
              updated_at: new Date(),
            },
          });
        }
      }

      return serializeBigInt(usuario);
    });
  },

  async toggleEstado(id: string, estado: EstadoUsuario) {
    const usuario = await prisma.usuarios.update({
      where: { id: BigInt(id) },
      data: { estado, updated_at: new Date() },
    });
    return serializeBigInt(usuario);
  },

  async eliminar(id: string) {
    const supabase = await createClient();
    const usuario = await prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
      select: { auth_id: true },
    });

    if (usuario?.auth_id) {
      await supabase.auth.admin.deleteUser(usuario.auth_id);
    }

    await prisma.usuarios.delete({ where: { id: BigInt(id) } });
    return { success: true };
  },
};
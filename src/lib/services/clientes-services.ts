import { prisma }          from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { createClient }    from '@/lib/supabase/server';
import type { EstadoCliente, TipoCliente } from '@prisma/client';

export const ClientesService = {

  // ── Listar ──────────────────────────────────────────────────
  async listar(params?: { busqueda?: string; estado?: string }) {
    const where: any = {};
    if (params?.estado && params.estado !== 'todos') {
      where.activo = params.estado;
    }
    if (params?.busqueda) {
      where.OR = [
        { razon_social:    { contains: params.busqueda, mode: 'insensitive' } },
        { ruc:             { contains: params.busqueda, mode: 'insensitive' } },
        { nombre_comercial:{ contains: params.busqueda, mode: 'insensitive' } },
        { usuarios: { email: { contains: params.busqueda, mode: 'insensitive' } } },
      ];
    }

    const clientes = await prisma.clientes.findMany({
      where,
      include: {
        usuarios: { select: { id: true, email: true, estado: true, rol: true, ultimo_acceso: true } },
        direcciones_cliente: { orderBy: [{ es_principal: 'desc' }, { created_at: 'asc' }] },
      },
      orderBy: { created_at: 'desc' },
    });
    return serializeBigInt(clientes);
  },

  // ── Obtener por ID ──────────────────────────────────────────
  async obtenerPorId(id: string) {
    const cliente = await prisma.clientes.findUnique({
      where: { id: BigInt(id) },
      include: {
        usuarios: {
          select: { id: true, email: true, estado: true, rol: true, ultimo_acceso: true, auth_id: true },
        },
        direcciones_cliente: { orderBy: [{ es_principal: 'desc' }, { created_at: 'asc' }] },
      },
    });
    return cliente ? serializeBigInt(cliente) : null;
  },

  // ── Crear cliente + usuario en Auth ─────────────────────────
  async crear(data: {
    ruc:               string;
    razon_social?:     string;
    nombre_comercial?: string;
    email:             string;
    password:          string;
    telefono?:         string;
    direccion_fiscal?: string;
    tipo_cliente?:     string;
  }) {
    const supabase = await createClient();

    // PASO 1: Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email:         data.email,
      password:      data.password,
      email_confirm: true,
    });
    if (authError || !authData.user) {
      throw new Error(authError?.message ?? 'Error al crear usuario en Supabase Auth');
    }
    const auth_id = authData.user.id;

    try {
      const resultado = await prisma.$transaction(async (tx) => {
        // PASO 2: Crear usuarios
        const usuario = await tx.usuarios.create({
          data: { email: data.email, rol: 'cliente' as any, estado: 'activo' as any, auth_id },
        });

        // PASO 3: Crear clientes vinculado al usuario
        const cliente = await tx.clientes.create({
          data: {
            ruc:              data.ruc,
            razon_social:     data.razon_social     ?? null,
            nombre_comercial: data.nombre_comercial ?? null,
            email:            data.email,
            telefono:         data.telefono          ?? null,
            direccion_fiscal: data.direccion_fiscal  ?? null,
            tipo_cliente:     (data.tipo_cliente as TipoCliente) ?? 'corporativo',
            activo:           'activo' as EstadoCliente,
            usuario_id:       usuario.id,
          },
          include: {
            usuarios:           { select: { id: true, email: true, estado: true, rol: true } },
            direcciones_cliente: true,
          },
        });
        return cliente;
      });
      return serializeBigInt(resultado);
    } catch (dbError) {
      await supabase.auth.admin.deleteUser(auth_id);
      throw dbError;
    }
  },

  // ── Actualizar ──────────────────────────────────────────────
  async actualizar(id: string, data: Partial<{
    ruc:               string;
    razon_social:      string;
    nombre_comercial:  string;
    email:             string;
    telefono:          string;
    direccion_fiscal:  string;
    tipo_cliente:      string;
    activo:            string;
  }>) {
    const { activo, tipo_cliente, ...rest } = data as any;
    const cliente = await prisma.clientes.update({
      where: { id: BigInt(id) },
      data: {
        ...rest,
        ...(activo       !== undefined && { activo:       activo       as EstadoCliente }),
        ...(tipo_cliente !== undefined && { tipo_cliente: tipo_cliente as TipoCliente  }),
        updated_at: new Date(),
      },
    });
    return serializeBigInt(cliente);
  },

  // ── Toggle estado (sincroniza con Auth) ─────────────────────
  async toggleEstado(clienteId: string, estado: EstadoCliente) {
    const supabase = await createClient();

    const cliente = await prisma.clientes.findUnique({
      where:   { id: BigInt(clienteId) },
      include: { usuarios: { select: { id: true, auth_id: true } } },
    });
    if (!cliente) throw new Error('Cliente no encontrado');

    // Sincronizar ban en Auth
    if (cliente.usuarios?.auth_id) {
      await supabase.auth.admin.updateUserById(cliente.usuarios.auth_id, {
        ban_duration: estado === 'inactivo' ? '87600h' : 'none',
      });
    }

    const [clienteActualizado] = await prisma.$transaction([
      prisma.clientes.update({
        where: { id: BigInt(clienteId) },
        data:  { activo: estado, updated_at: new Date() },
      }),
      ...(cliente.usuarios
        ? [prisma.usuarios.update({
            where: { id: cliente.usuarios.id },
            data:  { estado: estado === 'activo' ? 'activo' : 'inactivo' as any, updated_at: new Date() },
          })]
        : []),
    ]);
    return serializeBigInt(clienteActualizado);
  },

  // ── Direcciones ─────────────────────────────────────────────
  async agregarDireccion(clienteId: string, data: {
    alias:        string;
    direccion:    string;
    ciudad?:      string;
    departamento?: string;
    es_principal?: boolean;
  }) {
    return prisma.$transaction(async (tx) => {
      // Si es principal, quitar principal de las demás
      if (data.es_principal) {
        await tx.direcciones_cliente.updateMany({
          where: { cliente_id: BigInt(clienteId) },
          data:  { es_principal: false },
        });
      }
      const dir = await tx.direcciones_cliente.create({
        data: {
          cliente_id:   BigInt(clienteId),
          alias:        data.alias,
          direccion:    data.direccion,
          ciudad:       data.ciudad       ?? null,
          departamento: data.departamento ?? null,
          es_principal: data.es_principal ?? false,
        },
      });
      return serializeBigInt(dir);
    });
  },

  async actualizarDireccion(dirId: string, clienteId: string, data: Partial<{
    alias:        string;
    direccion:    string;
    ciudad:       string;
    departamento: string;
    es_principal: boolean;
  }>) {
    return prisma.$transaction(async (tx) => {
      if (data.es_principal) {
        await tx.direcciones_cliente.updateMany({
          where: { cliente_id: BigInt(clienteId), id: { not: BigInt(dirId) } },
          data:  { es_principal: false },
        });
      }
      const dir = await tx.direcciones_cliente.update({
        where: { id: BigInt(dirId) },
        data,
      });
      return serializeBigInt(dir);
    });
  },

  async eliminarDireccion(dirId: string) {
    await prisma.direcciones_cliente.delete({ where: { id: BigInt(dirId) } });
    return { success: true };
  },
};
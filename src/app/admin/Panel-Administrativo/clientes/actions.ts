'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { serializePrismaPayload } from '@/lib/serializers';
import { createClienteSchema, type CreateClienteInput } from '@/lib/schemas/clientes';
import { Prisma } from '@prisma/client';

// ============================================================
// INTERFACES DE RESPUESTA
// ============================================================
export interface ClienteRow {
  id: number;
  tipo_documento: string | null;
  ruc: string;
  nombre_completo: string | null;
  email: string | null;
  telefono: string | null;
  estado_comercial: string | null;
  moneda_defecto: string | null;
  created_at: string;
}

// ============================================================
// SERVER ACTIONS
// ============================================================

/**
 * Crear un nuevo cliente con transacción atómica
 * - Crea el cliente
 * - Opcionalmente crea su dirección principal
 * - Maneja errores de RUC duplicado
 */
export async function createCliente(
  rawInput: CreateClienteInput
): Promise<{ success: boolean; data?: ClienteRow; error?: string }> {
  try {
    // 1. Validar datos con Zod
    const parsed = createClienteSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Datos inválidos',
      };
    }

    const {
      tipo_documento,
      ruc,
      nombre,
      apellido_paterno,
      apellido_materno,
      razon_social,
      nombre_comercial,
      email,
      telefono,
      direccion_fiscal,
      pais,
      estado_comercial,
      lista_precios,
      sector,
      sub_sector,
      categoria_cliente,
      codigo_cliente,
      moneda_defecto,
      forma_pago_defecto,
      metodo_comercial,
      tipo_pedido_defecto,
      impuesto_defecto,
      // Dirección opcional
      crear_direccion,
      direccion_alias,
      direccion_detalle,
      direccion_ciudad,
      direccion_departamento,
    } = parsed.data;

    // 2. Verificar si el RUC ya existe
    const existingCliente = await prisma.clientes.findUnique({
      where: { ruc },
    });

    if (existingCliente) {
      return {
        success: false,
        error: `El ${tipo_documento} ${ruc} ya está registrado con el cliente "${
          existingCliente.razon_social ??
          `${existingCliente.nombre ?? ''} ${existingCliente.apellido_paterno ?? ''}`
        }". No se puede duplicar.`,
      };
    }

    // 3. Construir nombre completo para visualización
    const esPersonaJuridica = tipo_documento === 'RUC 20';
    const nombreCompleto = esPersonaJuridica
      ? razon_social
      : `${nombre ?? ''} ${apellido_paterno ?? ''} ${apellido_materno ?? ''}`.trim();

    // 4. Generar código de cliente automático si no se proporciona
    const codigoFinal = codigo_cliente ?? await generarCodigoCliente();

    // 5. Transacción atómica: Cliente + Dirección (opcional)
    const result = await prisma.$transaction(async (tx) => {
      // Crear cliente
      const cliente = await tx.clientes.create({
        data: {
          tipo_documento,
          ruc,
          nombre: nombre ?? null,
          apellido_paterno: apellido_paterno ?? null,
          apellido_materno: apellido_materno ?? null,
          razon_social: razon_social ?? null,
          nombre_comercial: nombre_comercial ?? null,
          email: email ?? null,
          telefono: telefono ?? null,
          direccion_fiscal: direccion_fiscal ?? null,
          pais: pais ?? 'Peru',
          estado_comercial: estado_comercial ?? 'Activo',
          lista_precios: lista_precios ?? null,
          sector: sector ?? 'General',
          sub_sector: sub_sector ?? 'General',
          categoria_cliente: categoria_cliente ?? 'General',
          codigo_cliente: codigoFinal,
          moneda_defecto: moneda_defecto ?? null,
          forma_pago_defecto: forma_pago_defecto ?? null,
          metodo_comercial: metodo_comercial ?? null,
          tipo_pedido_defecto: tipo_pedido_defecto ?? null,
          impuesto_defecto: impuesto_defecto ?? 'IGV',
          activo: 'activo',
        },
      });

      // Crear dirección principal si se solicita
      if (crear_direccion && direccion_detalle) {
        await tx.direcciones_cliente.create({
          data: {
            cliente_id: cliente.id,
            alias: direccion_alias ?? nombreCompleto ?? 'Principal',
            direccion: direccion_detalle,
            ciudad: direccion_ciudad ?? null,
            departamento: direccion_departamento ?? null,
            es_principal: true,
          },
        });
      }

      return cliente;
    });

    // 6. Revalidar paths
    revalidatePath('/admin/Panel-Administrativo/clientes');
    revalidatePath('/admin/Panel-Administrativo/cotizaciones');

    // 7. Construir respuesta
    const row: ClienteRow = {
      id: Number(result.id),
      tipo_documento: result.tipo_documento,
      ruc: result.ruc,
      nombre_completo: nombreCompleto,
      email: result.email,
      telefono: result.telefono,
      estado_comercial: result.estado_comercial,
      moneda_defecto: result.moneda_defecto,
      created_at: result.created_at?.toISOString().split('T')[0] ?? '',
    };

    return { success: true, data: serializePrismaPayload(row) };
  } catch (err: any) {
    console.error('Error creando cliente:', err);

    // Manejo específico de errores de Prisma
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return {
          success: false,
          error: 'Ya existe un cliente con este RUC. Verifique los datos e intente nuevamente.',
        };
      }
    }

    return {
      success: false,
      error: err.message ?? 'Error interno del servidor al crear el cliente',
    };
  }
}

/**
 * Obtener lista de clientes para selects
 */
export async function getClientesList(): Promise<
  { id: number; razon_social: string | null; ruc: string; tipo_documento: string | null }[]
> {
  try {
    const clientes = await prisma.clientes.findMany({
      where: { activo: 'activo' },
      select: {
        id: true,
        razon_social: true,
        ruc: true,
        tipo_documento: true,
      },
      orderBy: { razon_social: 'asc' },
    });

    return serializePrismaPayload(
      clientes.map((c) => ({
        id: Number(c.id),
        razon_social: c.razon_social,
        ruc: c.ruc,
        tipo_documento: c.tipo_documento,
      }))
    );
  } catch (err) {
    console.error('Error obteniendo lista de clientes:', err);
    return [];
  }
}

/**
 * Obtener detalle completo de un cliente
 */
export async function getClienteDetalle(clienteId: number) {
  try {
    const cliente = await prisma.clientes.findUnique({
      where: { id: BigInt(clienteId) },
      include: {
        direcciones_cliente: true,
      },
    });

    if (!cliente) {
      return null;
    }

    return serializePrismaPayload({
      id: Number(cliente.id),
      tipo_documento: cliente.tipo_documento,
      ruc: cliente.ruc,
      nombre: cliente.nombre,
      apellido_paterno: cliente.apellido_paterno,
      apellido_materno: cliente.apellido_materno,
      razon_social: cliente.razon_social,
      nombre_comercial: cliente.nombre_comercial,
      email: cliente.email,
      telefono: cliente.telefono,
      direccion_fiscal: cliente.direccion_fiscal,
      pais: cliente.pais,
      estado_comercial: cliente.estado_comercial,
      lista_precios: cliente.lista_precios,
      sector: cliente.sector,
      sub_sector: cliente.sub_sector,
      categoria_cliente: cliente.categoria_cliente,
      codigo_cliente: cliente.codigo_cliente,
      moneda_defecto: cliente.moneda_defecto,
      forma_pago_defecto: cliente.forma_pago_defecto,
      metodo_comercial: cliente.metodo_comercial,
      tipo_pedido_defecto: cliente.tipo_pedido_defecto,
      impuesto_defecto: cliente.impuesto_defecto,
      activo: cliente.activo,
      created_at: cliente.created_at?.toISOString(),
      direcciones: cliente.direcciones_cliente.map((d) => ({
        id: Number(d.id),
        alias: d.alias,
        direccion: d.direccion,
        ciudad: d.ciudad,
        departamento: d.departamento,
        es_principal: d.es_principal,
      })),
    });
  } catch (err) {
    console.error('Error obteniendo detalle de cliente:', err);
    return null;
  }
}

/**
 * Generar código de cliente único automático
 * Formato: CLI-XXXX (secuencial)
 */
async function generarCodigoCliente(): Promise<string> {
  const count = await prisma.clientes.count();
  return `CLI-${String(count + 1).padStart(4, '0')}`;
}

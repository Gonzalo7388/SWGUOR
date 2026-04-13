'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { serializePrismaPayload } from '@/lib/serializers';
import { createClienteSchema, type CreateClienteInput } from '@/lib/schemas/clientes';
import { Prisma, EstadoCliente, TipoCliente } from '@prisma/client';

// ============================================================
// INTERFACES DE RESPUESTA
// ============================================================
// Ajustada para coincidir estrictamente con tu tabla SQL
export interface ClienteRow {
  id: number;
  ruc: string;
  razon_social: string | null;
  telefono: string | null;
  email: string | null;
  direccion_fiscal: string | null;
  activo: string | null;
  tipo_cliente: string | null;
  usuario_id: number | null;
  created_at: string;
}

// ============================================================
// SERVER ACTIONS
// ============================================================

export async function createCliente(
  rawInput: CreateClienteInput
): Promise<{ success: boolean; data?: ClienteRow; error?: string }> {
  try {
    // 1. Validar con Zod
    const parsed = createClienteSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Datos inválidos',
      };
    }

    const {
      ruc,
      razon_social,
      telefono,
      email,
      direccion_fiscal,
      activo,
      tipo_cliente,
      usuario_id,
    } = parsed.data;

    // 2. Verificar RUC duplicado
    const existingCliente = await prisma.clientes.findUnique({
      where: { ruc },
    });

    if (existingCliente) {
      return {
        success: false,
        error: `El RUC/DNI ${ruc} ya está registrado con "${existingCliente.razon_social ?? ruc}". No se puede duplicar.`,
      };
    }

    // 3. Crear el registro en la base de datos (Sin transacciones innecesarias)
    const result = await prisma.clientes.create({
      data: {
        ruc,
        razon_social:     razon_social     ?? null,
        telefono:         telefono         ?? null,
        email:            email            ?? null,
        direccion_fiscal: direccion_fiscal ?? null,
        activo:           (activo as EstadoCliente) ?? EstadoCliente.activo,
        tipo_cliente:     (tipo_cliente as TipoCliente) ?? TipoCliente.corporativo,
        usuario_id:       usuario_id ? BigInt(usuario_id) : null,
      },
    });

    // 4. Revalidar cache
    revalidatePath('/admin/Panel-Administrativo/clientes');
    revalidatePath('/admin/Panel-Administrativo/cotizaciones');

    // 5. Mapear y retornar la respuesta
    const row: ClienteRow = {
      id:               Number(result.id),
      ruc:              result.ruc,
      razon_social:     result.razon_social,
      telefono:         result.telefono,
      email:            result.email,
      direccion_fiscal: result.direccion_fiscal,
      activo:           result.activo?.toString() ?? null,
      tipo_cliente:     result.tipo_cliente?.toString() ?? null,
      usuario_id:       result.usuario_id ? Number(result.usuario_id) : null,
      created_at:       result.created_at?.toISOString().split('T')[0] ?? '',
    };

    return { success: true, data: serializePrismaPayload(row) };

  } catch (err: any) {
    console.error('Error creando cliente:', err);

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        // P2002 puede saltar por el RUC o por el usuario_id (ambos tienen índice único)
        return {
          success: false,
          error: 'Ya existe un registro que choca con los datos proporcionados (RUC o Usuario ID duplicado).',
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
 * Lista de clientes activos para selects de cotizaciones/órdenes
 */
export async function getClientesList(): Promise<{ id: number; razon_social: string | null; ruc: string }[]> {
  try {
    const clientes = await prisma.clientes.findMany({
      where: {
        activo: EstadoCliente.activo,
      },
      select: {
        id:           true,
        razon_social: true,
        ruc:          true,
      },
      orderBy: { razon_social: 'asc' },
    });

    return serializePrismaPayload(
      clientes.map((c) => ({
        id:           Number(c.id),
        razon_social: c.razon_social,
        ruc:          c.ruc,
      }))
    );
  } catch (err) {
    console.error('Error obteniendo lista de clientes:', err);
    return [];
  }
}

/**
 * Detalle completo de un cliente
 */
export async function getClienteDetalle(clienteId: number) {
  try {
    const cliente = await prisma.clientes.findUnique({
      where: { id: BigInt(clienteId) },
    });

    if (!cliente) return null;

    return serializePrismaPayload({
      id:               Number(cliente.id),
      ruc:              cliente.ruc,
      razon_social:     cliente.razon_social,
      telefono:         cliente.telefono,
      email:            cliente.email,
      direccion_fiscal: cliente.direccion_fiscal,
      activo:           cliente.activo?.toString(),
      tipo_cliente:     cliente.tipo_cliente?.toString(),
      usuario_id:       cliente.usuario_id ? Number(cliente.usuario_id) : null,
      created_at:       cliente.created_at?.toISOString(),
      updated_at:       cliente.updated_at?.toISOString(),
    });
  } catch (err) {
    console.error('Error obteniendo detalle de cliente:', err);
    return null;
  }
}
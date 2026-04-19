'use server';

import { prisma }          from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import type { CreateClienteInput } from '@/lib/schemas/clientes';
import type { TipoCliente, EstadoCliente } from '@prisma/client';

export async function createCliente(
  data: CreateClienteInput & {
    crear_direccion?: boolean;
    direccion?: {
      alias:        string;
      direccion:    string;
      ciudad?:      string;
      departamento?: string;
    };
  }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const result = await prisma.$transaction(async (tx) => {

      // 1. Crear cliente
      const cliente = await tx.clientes.create({
        data: {
          ruc:              data.ruc,
          razon_social:     data.razon_social     ?? null,
          nombre_comercial: data.nombre_comercial ?? null,
          telefono:         data.telefono         ?? null,
          email:            data.email            || null,
          direccion_fiscal: data.direccion_fiscal ?? null,
          tipo_cliente:     data.tipo_cliente      as TipoCliente,
          activo:           data.activo            as EstadoCliente,
        },
      });

      // 2. Crear dirección si viene
      if (data.crear_direccion && data.direccion?.direccion) {
        await tx.direcciones_cliente.create({
          data: {
            cliente_id:   cliente.id,
            alias:        data.direccion.alias       || 'Principal',
            direccion:    data.direccion.direccion,
            ciudad:       data.direccion.ciudad       ?? null,
            departamento: data.direccion.departamento ?? null,
            es_principal: true,
          },
        });
      }

      return cliente;
    });

    return { success: true, data: serializeBigInt(result) };
  } catch (error: any) {
    console.error('[createCliente]', error);
    if (error.code === 'P2002') {
      return { success: false, error: 'Ya existe un cliente con ese RUC' };
    }
    return { success: false, error: error.message };
  }
}
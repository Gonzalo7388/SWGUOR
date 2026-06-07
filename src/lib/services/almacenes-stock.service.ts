// ─── TIPOS ────────────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

type OrigenMovimiento =
    | { tipo: 'ORDEN_COMPRA'; id: bigint }
    | { tipo: 'ORDEN_PRODUCCION'; id: bigint }
    | { tipo: 'PEDIDO_CLIENTE'; id: bigint }
    | { tipo: 'AJUSTE_MANUAL'; id: bigint }
    | { tipo: 'INVENTARIO_INICIAL'; id: bigint };

interface EntradaStockInput {
    almacenId: bigint;
    productoId?: bigint;
    insumoId?: bigint;
    materialId?: bigint;
    cantidad: number;
    usuarioId: bigint;
    motivo?: string;
    origen: OrigenMovimiento;
}

interface SalidaStockInput extends EntradaStockInput {
    verificarStock?: boolean; // default true
}

// ─── HELPERS PRIVADOS ─────────────────────────────────────────────────────────

const resolverTipoMovimiento = (
    origen: OrigenMovimiento,
    direccion: 'entrada' | 'salida'
) => {
    const mapa: Record<string, { entrada: string; salida: string }> = {
        ORDEN_COMPRA: { entrada: 'entrada', salida: 'devolucion_a_proveedor' },
        ORDEN_PRODUCCION: { entrada: 'produccion_entrada', salida: 'consumo_orden_produccion' },
        PEDIDO_CLIENTE: { entrada: 'recepcion_devolucion_cliente', salida: 'salida' },
        AJUSTE_MANUAL: { entrada: 'ajuste', salida: 'ajuste' },
        INVENTARIO_INICIAL: { entrada: 'inventario_inicial', salida: 'ajuste' },
    };
    return mapa[origen.tipo][direccion];
};

const verificarOrigenExiste = async (origen: OrigenMovimiento): Promise<void> => {
    switch (origen.tipo) {
        case 'ORDEN_COMPRA': {
            const oc = await prisma.ordenes_compra.findUnique({ where: { id: origen.id } });
            if (!oc) throw new Error(`Orden de compra ${origen.id} no encontrada`);
            if (!['confirmada', 'parcialmente_recibida'].includes(oc.estado))
                throw new Error(`Orden de compra ${origen.id} no está confirmada (estado: ${oc.estado})`);
            break;
        }
        case 'ORDEN_PRODUCCION': {
            const op = await prisma.ordenes_produccion.findUnique({ where: { id: origen.id } });
            if (!op) throw new Error(`Orden de producción ${origen.id} no encontrada`);
            if (!['en_produccion', 'completada'].includes(op.estado))
                throw new Error(`Orden de producción ${origen.id} no tiene estado válido (estado: ${op.estado})`);
            break;
        }
        case 'PEDIDO_CLIENTE': {
            const p = await prisma.pedidos.findUnique({ where: { id: origen.id } });
            if (!p) throw new Error(`Pedido ${origen.id} no encontrado`);
            if (!['pagado', 'en_produccion', 'listo_para_despacho'].includes(p.estado ?? ''))
                throw new Error(`Pedido ${origen.id} no está en estado válido (estado: ${p.estado})`);
            break;
        }
    }
};

// ─── SERVICE PRINCIPAL ────────────────────────────────────────────────────────

export const almacenesStockService = {

    // Entrada de stock (por orden de compra o producción)
    registrarEntrada: async (input: EntradaStockInput) => {
        await verificarOrigenExiste(input.origen);

        const tipoMovimiento = resolverTipoMovimiento(input.origen, 'entrada') as any;

        return prisma.$transaction(async (tx) => {
            // 1. Upsert en almacen_stock
            await upsertAlmacenStock(tx, input, input.cantidad);

            // 2. Registrar movimiento
            return tx.movimientos_inventario.create({
                data: {
                    tipo_movimiento: tipoMovimiento,
                    referencia_tipo: input.origen.tipo as any,
                    almacen_id: input.almacenId,
                    producto_id: input.productoId ?? null,
                    insumo_id: input.insumoId ?? null,
                    material_id: input.materialId ?? null,
                    cantidad: input.cantidad,
                    motivo: input.motivo ?? `Entrada por ${input.origen.tipo}`,
                    usuario_id: input.usuarioId,
                },
            });
        });
    },

    // Salida de stock (por pedido o consumo de producción)
    registrarSalida: async (input: SalidaStockInput) => {
        await verificarOrigenExiste(input.origen);

        if (input.verificarStock !== false) {
            await verificarStockSuficiente(input);
        }

        const tipoMovimiento = resolverTipoMovimiento(input.origen, 'salida') as any;

        return prisma.$transaction(async (tx) => {
            // 1. Descontar de almacen_stock
            await upsertAlmacenStock(tx, input, -input.cantidad);

            // 2. Registrar movimiento
            return tx.movimientos_inventario.create({
                data: {
                    tipo_movimiento: tipoMovimiento,
                    referencia_tipo: input.origen.tipo as any,
                    almacen_id: input.almacenId,
                    producto_id: input.productoId ?? null,
                    insumo_id: input.insumoId ?? null,
                    material_id: input.materialId ?? null,
                    cantidad: -input.cantidad,  // negativo = salida
                    motivo: input.motivo ?? `Salida por ${input.origen.tipo}`,
                    usuario_id: input.usuarioId,
                },
            });
        });
    },

    // Stock actual de un ítem específico en un almacén
    obtenerStock: async (
        almacenId: bigint,
        item: { productoId?: bigint; insumoId?: bigint; materialId?: bigint }
    ) => {
        const where = buildWhereItem(almacenId, item);
        return prisma.almacen_stock.findFirst({ where });
    },

    // Historial de movimientos de un almacén con filtros
    obtenerMovimientos: async (
        almacenId: bigint,
        filtros?: {
            referenciaTipo?: string;
            desde?: Date;
            hasta?: Date;
            limit?: number;
        }
    ) => {
        return prisma.movimientos_inventario.findMany({
            where: {
                almacen_id: almacenId,
                ...(filtros?.referenciaTipo && { referencia_tipo: filtros.referenciaTipo as any }),
                ...(filtros?.desde || filtros?.hasta ? {
                    created_at: {
                        ...(filtros.desde && { gte: filtros.desde }),
                        ...(filtros.hasta && { lte: filtros.hasta }),
                    }
                } : {}),
            },
            orderBy: { created_at: 'desc' },
            take: filtros?.limit ?? 50,
        });
    },
};

// ─── HELPERS INTERNOS ─────────────────────────────────────────────────────────

async function verificarStockSuficiente(input: SalidaStockInput) {
    const where = buildWhereItem(input.almacenId, {
        productoId: input.productoId,
        insumoId: input.insumoId,
        materialId: input.materialId,
    });

    const stock = await prisma.almacen_stock.findFirst({ where });
    const disponible = Number(stock?.cantidad ?? 0);

    if (disponible < input.cantidad) {
        throw new Error(
            `Stock insuficiente: disponible ${disponible}, solicitado ${input.cantidad}`
        );
    }
}

async function upsertAlmacenStock(
    tx: Prisma.TransactionClient,
    input: EntradaStockInput,
    delta: number
) {
    const where = buildWhereItem(input.almacenId, {
        productoId: input.productoId,
        insumoId: input.insumoId,
        materialId: input.materialId,
    });

    const existing = await tx.almacen_stock.findFirst({ where });

    if (existing) {
        return tx.almacen_stock.update({
            where: { id: existing.id },
            data: { cantidad: { increment: delta }, updated_at: new Date() },
        });
    }

    return tx.almacen_stock.create({
        data: {
            almacen_id: input.almacenId,
            producto_id: input.productoId ?? null,
            insumo_id: input.insumoId ?? null,
            material_id: input.materialId ?? null,
            cantidad: delta,
            updated_at: new Date(),
        },
    });
}

function buildWhereItem(
    almacenId: bigint,
    item: { productoId?: bigint; insumoId?: bigint; materialId?: bigint }
) {
    return {
        almacen_id: almacenId,
        producto_id: item.productoId ?? null,
        insumo_id: item.insumoId ?? null,
        material_id: item.materialId ?? null,
    };
}
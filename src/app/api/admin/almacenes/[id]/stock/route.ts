// app/api/admin/almacenes/[id]/stock/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

type RouteContext = { params: Promise<{ id: string }> };

// ── Tipo inferido del include usado en las queries ─────────────────────────────
type StockWithZona = Prisma.almacen_stockGetPayload<{
    include: { almacen_zonas: { select: { id: true; nombre: true } } };
}>;

function serializeStock(item: StockWithZona) {
    return {
        id: item.id.toString(),
        almacen_id: item.almacen_id.toString(),
        zona_id: item.zona_id?.toString() ?? null,
        producto_id: item.producto_id?.toString() ?? null,
        insumo_id: item.insumo_id?.toString() ?? null,
        material_id: item.material_id?.toString() ?? null,
        cantidad: Number(item.cantidad),
        stock_minimo: item.stock_minimo != null ? Number(item.stock_minimo) : null,
        updated_at: item.updated_at.toISOString(),
        tipo: item.producto_id ? 'producto' : item.insumo_id ? 'insumo' : 'material',
        zona: item.almacen_zonas
            ? { id: item.almacen_zonas.id.toString(), nombre: item.almacen_zonas.nombre }
            : null,
    };
}

// ── GET /api/admin/almacenes/[id]/stock?zona=&page=&limit= ────────────────────
export async function GET(req: NextRequest, { params }: RouteContext) {
    const { id: rawId } = await params; 
    let almacen_id: bigint;
    try { almacen_id = BigInt(rawId); } catch {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const zonaParam = searchParams.get('zona');
    const zona_id = zonaParam ? BigInt(zonaParam) : undefined;
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(100, Number(searchParams.get('limit') || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.almacen_stockWhereInput = {
        almacen_id,
        ...(zona_id !== undefined ? { zona_id } : {}),
    };

    try {
        const include = {
            almacen_zonas: { select: { id: true, nombre: true } },
        } satisfies Prisma.almacen_stockInclude;

        const [items, total] = await Promise.all([
            prisma.almacen_stock.findMany({
                where, skip, take: limit,
                orderBy: { updated_at: 'desc' },
                include,
            }),
            prisma.almacen_stock.count({ where }),
        ]);

        return NextResponse.json({
            data: items.map(serializeStock),
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('[GET stock]', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

// ── POST /api/admin/almacenes/[id]/stock ──────────────────────────────────────
export async function POST(req: NextRequest, { params }: RouteContext) {
    const { id: rawId } = await params;   // ✅ await params (Next.js 15)
    let almacen_id: bigint;
    try { almacen_id = BigInt(rawId); } catch {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    try {
        const body = await req.json();

        // 1. Extraemos de forma directa y flexible para que Zod externo no bloquee la petición
        const { zona_id, producto_id, insumo_id, material_id, cantidad, stock_minimo } = body;

        // 2. ── INTERCEPTOR AUTOMÁTICO DE ZONA (TEXTO A BIGINT) ───────────────────────
        let zonaIdFinal: bigint | null = null;

        if (zona_id && !isNaN(Number(zona_id))) {
            zonaIdFinal = BigInt(zona_id);
        } else if (typeof zona_id === 'string' && zona_id.trim() !== '') {
            // Buscamos dinámicamente si el string coincide con el nombre de una zona de este almacén
            const zonaEncontrada = await prisma.almacen_zonas.findFirst({
                where: {
                    almacen_id,
                    nombre: { contains: zona_id, mode: 'insensitive' },
                    activo: true
                }
            });

            if (zonaEncontrada) {
                zonaIdFinal = zonaEncontrada.id;
            } else {
                // Alternativa: Si no encuentra coincidencia exacta, toma la primera zona activa asignada al almacén
                const primeraZona = await prisma.almacen_zonas.findFirst({
                    where: { almacen_id, activo: true }
                });
                if (primeraZona) zonaIdFinal = primeraZona.id;
            }
        }

        if (!zonaIdFinal) {
            return NextResponse.json({ error: 'La zona seleccionada no es válida para este almacén.' }, { status: 422 });
        }

        // 3. ── ADAPTACIÓN DE DATOS PARA COMPATIBILIDAD PRISMA ───────────────────────
        const finalProductoId = producto_id ? BigInt(producto_id) : null;
        const finalInsumoId = insumo_id ? BigInt(insumo_id) : null;
        const finalMaterialId = material_id ? BigInt(material_id) : null;
        
        const cantidadDecimal = cantidad ? cantidad.toString() : "0";
        const stockMinimoCalculado = stock_minimo ? Number(stock_minimo) : 0;

        // 4. ── OPERACIÓN DE CREACIÓN EN BASE DE DATOS ───────────────────────────────
        const item = await prisma.almacen_stock.create({
            data: {
                almacen_id,
                zona_id: zonaIdFinal,
                producto_id: finalProductoId,
                insumo_id: finalInsumoId,
                material_id: finalMaterialId,
                cantidad: cantidadDecimal,
                stock_minimo: stockMinimoCalculado,
            },
            include: { almacen_zonas: { select: { id: true, nombre: true } } },
        });

        return NextResponse.json(serializeStock(item), { status: 201 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
            return NextResponse.json({ error: 'Ya existe stock para ese ítem en esta zona' }, { status: 409 });
        
        console.error('[POST stock Error]', error);
        return NextResponse.json({ error: 'Error interno del servidor al registrar el stock' }, { status: 500 });
    }
}
// src/app/api/portal/cotizaciones/[id]/items/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireServerAuth } from '@/lib/auth/server';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireServerAuth();
        if (!auth.success) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const { id } = await params;
        const cotizacionId = Number(id);
        if (isNaN(cotizacionId)) {
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
        }

        // Ownership check: la cotización debe pertenecer al cliente del usuario
        const cliente = await prisma.clientes.findFirst({
            where: { usuario_id: BigInt(auth.user.id) },
            select: { id: true },
        });

        if (!cliente) {
            return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
        }

        const cotizacion = await prisma.cotizaciones.findUnique({
            where: { id: BigInt(cotizacionId) },
            select: { cliente_id: true },
        });

        if (!cotizacion) {
            return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 });
        }

        if (cotizacion.cliente_id !== cliente.id) {
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
        }

        // Obtener los ítems con datos del producto y variante
        const items = await prisma.cotizacion_items.findMany({
            where: { cotizacion_id: BigInt(cotizacionId) },
            include: {
                productos: {
                    select: { id: true, nombre: true, sku: true, precio: true, imagen: true },
                },
                variantes_producto: {
                    select: { id: true, color: true, talla: true, precio_adicional: true, estado: true },
                },
            },
        });

        const data = items.map((item) => ({
            producto_id: Number(item.producto_id),
            producto_nombre: item.productos?.nombre ?? 'Producto',
            producto_sku: item.productos?.sku ?? '',
            variante_id: item.variante_id ? Number(item.variante_id) : null,
            color: item.variantes_producto?.color ?? item.color_snapshot,
            talla: item.variantes_producto?.talla ?? item.talla_snapshot,
            cantidad: Number(item.cantidad),
            imagen: item.productos?.imagen
                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos/${item.productos.imagen}`
                : null,
            precio_catalogo:
                Number(item.productos?.precio ?? 0) +
                Number(item.variantes_producto?.precio_adicional ?? 0),
            precio_unitario_snapshot: Number(item.precio_unitario_snapshot ?? 0),
        }));

        return NextResponse.json({ data });
    } catch (err) {
        console.error('[GET /api/portal/cotizaciones/[id]/items]', err);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
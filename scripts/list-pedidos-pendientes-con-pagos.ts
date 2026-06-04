import 'dotenv/config';
import { prisma } from '@/lib/prisma';

async function main() {
  try {
    const pedidos = await prisma.pedidos.findMany({
      where: { estado: 'pendiente', pagos: { some: {} } },
      include: {
        pagos: { select: { id_uuid: true, monto: true, estado: true, verificado_at: true, fecha_pago: true } },
        pedido_items: { select: { id: true, producto_id: true, cantidad: true } },
        clientes: { select: { id: true, razon_social: true } },
      },
      orderBy: { created_at: 'asc' },
      take: 200,
    });

    console.log(`Encontrados ${pedidos.length} pedidos pendientes con pagos asociados:`);
    for (const p of pedidos) {
      console.log(JSON.stringify({ id: String(p.id), cliente: p.clientes?.razon_social ?? null, total: p.total ?? null, total_unidades: p.total_unidades, pagos: p.pagos.map(px => ({ id: px.id_uuid, monto: String(px.monto), estado: px.estado, verificado_at: px.verificado_at })) }));
    }

    process.exit(0);
  } catch (err) {
    console.error('Error listando pedidos:', err);
    process.exit(1);
  }
}

main();

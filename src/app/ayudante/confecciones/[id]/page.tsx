import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AyudanteConfeccionWorkspace } from '@/components/ayudante/AyudanteConfeccionWorkspace';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AyudanteConfeccionPage({ params }: PageProps) {
  const { id } = await params;

  const conf = await prisma.confecciones.findUnique({
    where: { id: BigInt(id) },
    include: {
      talleres: { select: { nombre: true, especialidad: true } },
      ordenes_produccion: {
        include: {
          pedidos: {
            select: {
              id: true,
              estado: true,
              clientes: {
                select: { razon_social: true, nombre_comercial: true },
              },
            },
          },
        },
      },
    },
  });

  if (!conf) notFound();

  const pedido = conf.ordenes_produccion?.pedidos;
  const cliente =
    pedido?.clientes?.razon_social ||
    pedido?.clientes?.nombre_comercial ||
    'Cliente';

  const conformidadAprobada =
    conf.estado === 'completada' && pedido?.estado === 'listo_para_despacho';

  return (
    <AyudanteConfeccionWorkspace
      confeccion={{
        id: String(conf.id),
        estado: conf.estado,
        prenda: conf.prenda,
        cantidad: conf.cantidad,
        notas: conf.notas,
        taller: conf.talleres
          ? {
              nombre: conf.talleres.nombre,
              especialidad: conf.talleres.especialidad,
            }
          : null,
        pedido: pedido
          ? {
              id: String(pedido.id),
              estado: pedido.estado ?? 'pendiente',
              cliente,
            }
          : null,
        conformidadAprobada,
      }}
    />
  );
}

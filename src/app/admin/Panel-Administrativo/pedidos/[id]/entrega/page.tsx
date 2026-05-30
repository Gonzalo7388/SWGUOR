import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerAuthUser } from '@/lib/auth/server';
import { PedidoEntregaForm } from '@/components/admin/pedidos/entrega/PedidoEntregaForm';

export const dynamic = 'force-dynamic';

const ROLES = ['administrador', 'gerente'] as const;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PedidoEntregaPage({ params }: PageProps) {
  const auth = await getServerAuthUser();
  if (!auth.success) notFound();
  if (!ROLES.includes(auth.user.rol as (typeof ROLES)[number])) {
    redirect('/admin/acceso-denegado');
  }

  const { id } = await params;

  const pedido = await prisma.pedidos.findUnique({
    where: { id: BigInt(id) },
    select: { id: true, estado: true },
  });

  if (!pedido) notFound();

  if (pedido.estado === 'entregado') {
    redirect(`/admin/Panel-Administrativo/pedidos/${id}`);
  }

  const despacho = await prisma.despachos.findFirst({
    where: {
      pedido_id: BigInt(id),
      estado: { in: ['preparando', 'en_ruta'] },
    },
    orderBy: { created_at: 'desc' },
  });

  if (!despacho) {
    if (pedido.estado === 'listo_para_despacho') {
      redirect(`/admin/Panel-Administrativo/pedidos/${id}/empaque`);
    }
    redirect(`/admin/Panel-Administrativo/pedidos/${id}`);
  }

  return (
    <PedidoEntregaForm
      pedidoId={id}
      despacho={{
        id: String(despacho.id),
        estado: despacho.estado,
        direccion_entrega: despacho.direccion_entrega,
        fecha_entrega: despacho.fecha_entrega?.toISOString() ?? null,
      }}
    />
  );
}

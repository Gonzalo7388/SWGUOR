import { redirect } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

export default async function PedidoDetalleRedirectPage({ params }: Props) {
  const { id } = await params;
  redirect(`/portal/mis-pedidos/${id}`);
}

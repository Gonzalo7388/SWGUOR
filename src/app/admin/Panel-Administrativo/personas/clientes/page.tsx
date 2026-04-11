import { getClienteStats, getClientes } from './components/actions';
import ClientesPageClient from './components/ClientesPageClient';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function ClientesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 0);
  const statusFilter = params.status ?? null;
  const search = params.search ?? '';
  const pageSize = 10;

  const stats = await getClienteStats();
  const { data, totalCount } = await getClientes(page, pageSize, statusFilter, search);

  return (
    <ClientesPageClient
      initialData={data}
      initialStats={stats}
      initialPage={page}
      initialStatusFilter={statusFilter}
      initialSearch={search}
      totalCount={totalCount}
      pageSize={pageSize}
    />
  );
}

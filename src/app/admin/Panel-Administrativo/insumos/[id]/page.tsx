'use client';

import { use } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInsumoDetalle } from '@/lib/hooks/useInsumos';
import { InsumoDetalle } from '@/components/admin/insumos/InsumoDetalle';
import type { InsumoDetalleRow } from '@/lib/helpers/insumos-helpers';

export default function InsumoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, error } = useInsumoDetalle(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50/30">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Insumo no encontrado</p>
        <Link href="/admin/Panel-Administrativo/insumos">
          <Button variant="outline">Volver al listado</Button>
        </Link>
      </div>
    );
  }

  return <InsumoDetalle insumo={data as InsumoDetalleRow} />;
}

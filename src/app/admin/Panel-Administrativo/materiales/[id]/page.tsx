'use client';

import { use } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMaterialDetalleCompras } from '@/lib/hooks/useMaterialesCompras';
import { MaterialDetalle } from '@/components/admin/materiales/MaterialDetalle';
import type { MaterialDetalleRow } from '@/lib/helpers/materiales-compras-helpers';

export default function MaterialDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, error } = useMaterialDetalleCompras(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50/30">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Material no encontrado</p>
        <Link href="/admin/Panel-Administrativo/materiales">
          <Button variant="outline">Volver al listado</Button>
        </Link>
      </div>
    );
  }

  return <MaterialDetalle material={data as MaterialDetalleRow} />;
}

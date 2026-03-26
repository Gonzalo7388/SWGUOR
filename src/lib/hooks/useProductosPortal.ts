
'use client';

import { useEffect, useState, useCallback } from 'react';

interface Opts {
  busqueda?: string;
  categoriaId?: number;
  talla?: string;
  limite?: number;
}

export function useProductosPortal({ busqueda = '', categoriaId, talla, limite = 24 }: Opts) {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limite: String(limite) });
    if (busqueda)    params.set('busqueda',    busqueda);
    if (categoriaId) params.set('categoria_id', String(categoriaId));
    if (talla)       params.set('talla',        talla);

    const res  = await window.fetch(`/api/ecommerce/productos?${params}`);
    const data = await res.json();
    setProductos(data.data ?? []);
    setLoading(false);
  }, [busqueda, categoriaId, talla, limite]);

  // Debounce de 300 ms en la búsqueda
  useEffect(() => {
    const t = setTimeout(fetch, busqueda ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetch, busqueda]);

  return { productos, loading };
}
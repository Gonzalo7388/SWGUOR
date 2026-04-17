import { useState, useEffect } from 'react';

export type ProductoStockResumen = {
  producto_id: number;
  producto_nombre: string;
  stock_total_adicional: number;
};

export type VarianteStockResumen = {
  variante_id: number;
  producto_id: number;
  producto_nombre: string;
  color: string;
  talla: string;
  stock_variante_stock_adicional: number;
};

export function useProductoStockResumen() {
  const [data, setData] = useState<ProductoStockResumen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/productos/stock-resumen')
      .then(res => res.json())
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, error };
}

export function useVarianteStockResumen(producto_id?: number) {
  const [data, setData] = useState<VarianteStockResumen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = producto_id
      ? `/api/admin/productos/variantes-resumen?producto_id=${producto_id}`
      : '/api/admin/productos/variantes-resumen';

    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [producto_id]);

  return { data, isLoading, error };
}
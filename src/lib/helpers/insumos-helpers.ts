import type { ApiResponse } from '@/lib/schemas/inventario';

const API = '/api/admin/insumos';

export interface ListarInsumosParams {
  tipo?: string;
  categoria?: string;
  busqueda?: string;
  stockBajo?: boolean;
  proveedorId?: string;
  sortOrder?: 'asc' | 'desc' | 'none';
}

export async function fetchInsumosCompras(params?: ListarInsumosParams) {
  const query = new URLSearchParams();
  if (params?.tipo) query.set('tipo', params.tipo);
  if (params?.categoria) query.set('categoria_insumo', params.categoria);
  if (params?.busqueda) query.set('busqueda', params.busqueda);
  if (params?.stockBajo) query.set('bajo_stock', 'true');
  if (params?.proveedorId) query.set('proveedor_id', params.proveedorId);
  if (params?.sortOrder && params.sortOrder !== 'none') query.set('sort', params.sortOrder);

  const res = await fetch(`${API}?${query.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar insumos');
  const json = await res.json();
  return (json.data?.insumos ?? []) as InsumoCompraRow[];
}

export async function fetchInsumoDetalle(id: string) {
  const res = await fetch(`${API}/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Insumo no encontrado');
  const json = await res.json();
  return (json.data ?? json) as InsumoDetalleRow;
}

export async function createInsumoCompras(data: Record<string, unknown>): Promise<ApiResponse> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateInsumoCompras(
  id: string,
  data: Record<string, unknown>,
): Promise<ApiResponse> {
  const res = await fetch(`${API}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export interface InsumoCompraRow {
  id: string;
  nombre: string;
  tipo: string;
  categoria_insumo: string;
  unidad_medida: string;
  stock_actual: number | string;
  stock_minimo: number | string;
  stock_maximo?: number | string | null;
  precio_unitario?: number | string | null;
  proveedor_id?: string | null;
  proveedores?: { id: string; razon_social: string } | null;
  _count?: { ordenes_compra_items: number };
}

export interface InsumoDetalleRow extends InsumoCompraRow {
  ubicacion_almacen?: string | null;
  alerta_bajo_stock?: boolean | null;
  almacenes?: { id: string; nombre: string } | null;
  proveedores?: { id: string; razon_social: string; ruc?: string } | null;
  ordenes_compra_items?: Array<{
    id: string;
    cantidad_pedida: number | string;
    cantidad_recibida: number | string;
    precio_unitario: number | string;
    subtotal?: number | string | null;
    ordenes_compra: {
      id: string;
      estado: string;
      estado_pago: string;
      total_orden: number | string;
      fecha_prometida?: string | null;
      created_at: string;
      proveedores?: { id: string; razon_social: string } | null;
    };
  }>;
  _count?: { ordenes_compra_items: number; movimientos_inventario: number };
}

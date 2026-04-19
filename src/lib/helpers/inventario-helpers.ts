import type { ApiResponse } from "@/lib/schemas/inventario";

const API = "/api/admin/inventario";

// ── INSUMOS ───────────────────────────────────────────────────────────────────

export async function fetchInsumos(params?: {
  tipo?:      string;
  categoria?: string;
  busqueda?:  string;
  stockBajo?: boolean;
  sortOrder?: "asc" | "desc" | "none";
}): Promise<{ insumos: any[]; proveedores: any[] }> {
  const query = new URLSearchParams();
  if (params?.tipo)                                     query.set("tipo",       params.tipo);
  if (params?.categoria)                                query.set("categoria",  params.categoria);
  if (params?.busqueda)                                 query.set("busqueda",   params.busqueda);
  if (params?.stockBajo)                                query.set("stock_bajo", "true");
  if (params?.sortOrder && params.sortOrder !== "none") query.set("sort",       params.sortOrder);

  const res = await fetch(`${API}?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al cargar insumos");
  return res.json();
}

export async function fetchInsumoById(id: string): Promise<any> {
  const res = await fetch(`${API}/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Insumo no encontrado");
  const result = await res.json();
  return result.data ?? result;
}

export async function createInsumo(data: any): Promise<ApiResponse> {
  const res = await fetch(API, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  });
  return res.json();
}

export async function updateInsumo(
  id: string,
  data: {
    nombre?:           string;
    tipo?:             string;
    categoria_insumo?: string;
    unidad_medida?:    string;
    stock_minimo?:     number;
    stock_maximo?:     number | null;
    precio_unitario?:  number | null;
    proveedor_id?:     number | null;
    ubicacion_almacen?: string | null;
    alerta_bajo_stock?: boolean;
  }
): Promise<ApiResponse> {
  const res = await fetch(`${API}/${id}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  });
  return res.json();
}

export async function deleteInsumo(id: string): Promise<ApiResponse> {
  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  return res.json();
}

// ── STOCK ─────────────────────────────────────────────────────────────────────

export async function ajustarStock(
  id: string,
  data: {
    operacion:        "sumar" | "restar" | "absoluto";
    cantidad:         number;
    motivo?:          string | null;
    costo_unitario?:  number | null;
    referencia_tipo?: string | null;
    referencia_id?:   number | null;
  }
): Promise<ApiResponse> {
  const res = await fetch(`${API}/${id}/stock`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  });
  return res.json();
}

// ── MOVIMIENTOS ───────────────────────────────────────────────────────────────

export async function fetchMovimientos(params?: {
  insumoId?: string;
  desde?:    string;
  hasta?:    string;
  limite?:   number;
}): Promise<{ movimientos: any[] }> {
  const query = new URLSearchParams();
  if (params?.insumoId) query.set("insumo_id", params.insumoId);
  if (params?.desde)    query.set("desde",     params.desde);
  if (params?.hasta)    query.set("hasta",     params.hasta);
  if (params?.limite)   query.set("limite",    String(params.limite));

  const res = await fetch(`${API}/movimientos?${query.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al cargar movimientos");
  return res.json();
}
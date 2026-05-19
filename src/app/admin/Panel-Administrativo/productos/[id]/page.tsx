"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import ProductoDetalle from "@/components/admin/productos/detalle/ProductoDetalle";

// ── Fetchers ──────────────────────────────────────────────────
async function fetchProducto(id: string) {
  const res = await fetch(`/api/admin/productos/${id}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Error al cargar producto");
  return body;
}

async function fetchCategorias() {
  const res = await fetch("/api/admin/categorias");
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Error al cargar categorías");
  return Array.isArray(body) ? body : (body.data ?? []);
}

// ── Page ──────────────────────────────────────────────────────
export default function ProductoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: producto, isLoading: loadingProducto } = useQuery({
    queryKey: ["producto-detalle", id],
    queryFn: () => fetchProducto(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  const { data: categorias = [], isLoading: loadingCategorias } = useQuery({
    queryKey: ["categorias-lista"],
    queryFn: fetchCategorias,
    staleTime: 1000 * 60 * 5, // 5 min — no cambian seguido
  });

  // ── Loading ────────────────────────────────────────────────
  if (loadingProducto || loadingCategorias) return (
    <div className="h-screen flex flex-col items-center justify-center bg-guor-cream/60">
      <div className="w-10 h-10 border-4 border-guor-brown border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-guor-gold/60 text-sm font-black uppercase tracking-widest">
        Cargando producto…
      </p>
    </div>
  );

  // ── Not found ──────────────────────────────────────────────
  if (!producto) return (
    <div className="h-screen flex flex-col items-center justify-center bg-guor-cream/60 gap-4">
      <Package className="w-16 h-16 text-guor-peach" strokeWidth={1} />
      <p className="text-guor-gold/60 font-black uppercase tracking-widest text-sm">
        Producto no encontrado
      </p>
      <Button
        variant="outline"
        onClick={() => router.push("/admin/Panel-Administrativo/productos")}
      >
        Volver al inventario
      </Button>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────
  return (
    <ProductoDetalle
      producto={producto}
      categorias={categorias}
    />
  );
}
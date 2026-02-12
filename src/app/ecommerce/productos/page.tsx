'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useCategoriasEcommerce } from '@/lib/hooks/useCategoriasEcommerce';
import ProductCard from '@/components/ecommerce/productos/ProductCard';

// IMPORTACIÓN DINÁMICA
const FiltrosLaterales = dynamic(() => import('@/components/ecommerce/productos/FiltrosLaterales').then(mod => mod.FiltrosLaterales), { 
  ssr: false, 
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-xl" /> 
});
const Paginacion = dynamic(() => import('@/components/ecommerce/productos/Paginacion').then(mod => mod.Paginacion), { ssr: false });

export default function TodosLosProductos() {
  const searchParams = useSearchParams();
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { categorias } = useCategoriasEcommerce();

  const [busqueda, setBusqueda] = useState('');
  const [categoriaSel, setCategoriaSel] = useState('todos');
  const [rangoPrecio, setRangoPrecio] = useState(500);
  const [paginaActual, setPaginaActual] = useState(1);
  
  const productosPorPagina = 15;

  // Leer parámetro de categoría de la URL
  useEffect(() => {
    const categoriaParam = searchParams.get('categoria');
    if (categoriaParam) {
      setCategoriaSel(categoriaParam);
      setPaginaActual(1);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ecommerce/productos?limite=999');
        const result = await response.json();
        setProductos(result.data || []);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  const productosFiltrados = useMemo(() => {
    return productos.filter(p => (
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      (categoriaSel === 'todos' || p.categoria_id?.toString() === categoriaSel) &&
      p.precio <= rangoPrecio
    ));
  }, [productos, busqueda, categoriaSel, rangoPrecio]);

  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const productosVisibles = productosFiltrados.slice(
    (paginaActual - 1) * productosPorPagina,
    paginaActual * productosPorPagina
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="w-full">
        {/* Título alineado y compacto */}
        <div className="py-10 border-b border-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Productos
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row gap-10 text-left">
            
            {/* Sidebar con buscador integrado */}
            <aside className="w-full lg:w-64 shrink-0">
              <FiltrosLaterales 
                categorias={categorias}
                categoriaSel={categoriaSel}
                setCategoriaSel={(id) => { setCategoriaSel(id); setPaginaActual(1); }}
                rangoPrecio={rangoPrecio}
                setRangoPrecio={(precio) => { setRangoPrecio(precio); setPaginaActual(1); }}
                busqueda={busqueda}
                setBusqueda={(val) => { setBusqueda(val); setPaginaActual(1); }}
              />
            </aside>

            <main className="flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                  <Loader2 className="animate-spin" size={32} />
                </div>
              ) : productosVisibles.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                    {productosVisibles.map((p) => <ProductCard key={p.id} producto={p} />)}
                  </div>

                  <Paginacion 
                    totalPaginas={totalPaginas}
                    paginaActual={paginaActual}
                    setPaginaActual={setPaginaActual}
                  />
                </>
              ) : (
                /* Estado sin resultados: Solo texto y botón */
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <p className="text-gray-500 font-medium mb-4">
                    No se encontraron productos que coincidan con tu búsqueda.
                  </p>
                  <button 
                    onClick={() => { setBusqueda(''); setCategoriaSel('todos'); setRangoPrecio(500); }}
                    className="text-sm font-bold text-[#f02d65] hover:underline uppercase tracking-widest"
                  >
                    Restablecer filtros
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </header>
    </div>
  );
}
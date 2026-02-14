'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Loader2, ChevronRight } from 'lucide-react';
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
      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/ecommerce" className="hover:text-gray-900 transition-colors">
              Inicio
            </Link>
            <ChevronRight size={14} strokeWidth={2} />
            <span className="text-gray-900 font-medium">Productos</span>
          </nav>
        </div>
      </div>

      <header className="w-full">
        {/* Título centrado y compacto */}
        <div className="py-12 text-center">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium mb-3">
              Productos
            </p>
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight mb-4">
              Todas las <span className="italic">Colecciones</span>
            </h1>
            <p className="text-sm text-gray-500 max-w-xl mx-auto font-light">
              Explora nuestra selección curada de prendas diseñadas para cada ocasión.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-16">
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
                  {/* Contador de resultados */}
                  <div className="mb-8 pb-6 border-b border-gray-100">
                    <p className="text-sm text-gray-500">
                      {productosFiltrados.length} {productosFiltrados.length === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>

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
                    className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    Restablecer filtros →
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
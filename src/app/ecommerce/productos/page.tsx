"use client";

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Loader2, ChevronRight, X } from 'lucide-react'; // Añadimos X para cerrar filtros
import { useCategoriasEcommerce } from '@/lib/hooks/useCategoriasEcommerce';
import ProductCard from '@/components/ecommerce/productos/ProductCard';
import { FiltrosLaterales } from '@/components/ecommerce/productos/FiltrosLaterales';

const Paginacion = dynamic(() => 
  import('@/components/ecommerce/productos/Paginacion').then(mod => mod.Paginacion), 
  { ssr: false }
);

export default function TodosLosProductos() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { categorias } = useCategoriasEcommerce();

  // ESTADOS DE FILTROS
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSel, setCategoriaSel] = useState('todos');
  const [rangoPrecio, setRangoPrecio] = useState(1000);
  const [maximoPermitido, setMaximoPermitido] = useState(1000);
  const [tallasSel, setTallasSel] = useState<string[]>([]);
  const [coloresSel, setColoresSel] = useState<string[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);
  
  const productosPorPagina = 12;

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        // Llamada a la API que ahora trae el JOIN con variantes_producto
        const response = await fetch('/api/ecommerce/productos?limite=999');
        const result = await response.json();
        const data = result.data || [];
        setProductos(data);

        if (data.length > 0) {
          const precioMasAlto = Math.max(...data.map((p: any) => p.precio));
          const techo = Math.ceil(precioMasAlto / 10) * 10; // Redondeo limpio
          setMaximoPermitido(techo);
          setRangoPrecio(techo);
        }
      } catch (err) {
        console.error('Error al cargar productos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  // FILTRADO MULTIDIMENSIONAL (Optimizado para las nuevas variantes)
  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      // 1. Búsqueda por texto (Nombre o SKU)
      const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            p.sku?.toLowerCase().includes(busqueda.toLowerCase());

      // 2. Categoría
      const matchCategoria = categoriaSel === 'todos' || p.categoria_id?.toString() === categoriaSel;

      // 3. Rango de Precio
      const matchPrecio = p.precio <= rangoPrecio;
      
      // 4. Filtrar por Tallas (Lógica: Alguna variante debe cumplir)
      const matchTalla = tallasSel.length === 0 || 
        p.variantes?.some((v: any) => tallasSel.includes(v.talla));
        
      // 5. Filtrar por Colores (Lógica: Alguna variante debe cumplir)
      const matchColor = coloresSel.length === 0 || 
        p.variantes?.some((v: any) => coloresSel.includes(v.color));

      return matchBusqueda && matchCategoria && matchPrecio && matchTalla && matchColor;
    });
  }, [productos, busqueda, categoriaSel, rangoPrecio, tallasSel, coloresSel]);

  // RESET DE PÁGINA AL FILTRAR
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, categoriaSel, rangoPrecio, tallasSel, coloresSel]);

  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const productosVisibles = productosFiltrados.slice(
    (paginaActual - 1) * productosPorPagina,
    paginaActual * productosPorPagina
  );

  // Función para limpiar filtros individuales (Chips)
  const removeTalla = (talla: string) => setTallasSel(tallasSel.filter(t => t !== talla));
  const removeColor = (color: string) => setColoresSel(coloresSel.filter(c => c !== color));

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER / BREADCRUMB */}
      <div className="border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
          <Link href="/ecommerce" className="hover:text-black transition-colors">Inicio</Link>
          <ChevronRight size={10} />
          <span className="text-black">Catálogo</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* BARRA LATERAL */}
          <aside className="w-full lg:w-64 shrink-0">
            <FiltrosLaterales 
              categorias={categorias}
              categoriaSel={categoriaSel}
              setCategoriaSel={setCategoriaSel}
              rangoPrecio={rangoPrecio}
              setRangoPrecio={setRangoPrecio}
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              maximoPermitido={maximoPermitido}
              tallasSel={tallasSel}
              setTallasSel={setTallasSel}
              coloresSel={coloresSel}
              setColoresSel={setColoresSel}
            />
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1">
            {/* TOOLBAR SUPERIOR */}
            <div className="flex flex-col gap-4 mb-8 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">
                  {categoriaSel === 'todos' ? 'Nueva Colección' : categorias.find(c => c.id.toString() === categoriaSel)?.nombre}
                </h2>
                <span className="text-[11px] text-gray-400 font-bold uppercase">
                  {productosFiltrados.length} Artículos
                </span>
              </div>

              {/* CHIPS DE FILTROS ACTIVOS (Mejora UX) */}
              {(tallasSel.length > 0 || coloresSel.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {tallasSel.map(t => (
                    <button key={t} onClick={() => removeTalla(t)} className="flex items-center gap-1 px-2 py-1 bg-gray-900 text-white text-[9px] uppercase font-bold rounded-full">
                      Talla: {t} <X size={10} />
                    </button>
                  ))}
                  {coloresSel.map(c => (
                    <button key={c} onClick={() => removeColor(c)} className="flex items-center gap-1 px-2 py-1 bg-rose-500 text-white text-[9px] uppercase font-bold rounded-full">
                      Color: {c} <X size={10} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="relative">
                  <Loader2 className="animate-spin text-rose-500" size={48} />
                  <div className="absolute inset-0 m-auto h-2 w-2 bg-rose-500 rounded-full animate-pulse" />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Actualizando Stock...</p>
              </div>
            ) : productosVisibles.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                  {productosVisibles.map((p) => (
                    <ProductCard key={p.id} producto={p} />
                  ))}
                </div>
                <Paginacion 
                  totalPaginas={totalPaginas} 
                  paginaActual={paginaActual} 
                  setPaginaActual={setPaginaActual} 
                />
              </>
            ) : (
              <div className="py-32 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                <div className="max-w-xs mx-auto">
                   <p className="text-gray-900 text-sm font-bold uppercase tracking-tight">Sin coincidencias</p>
                   <p className="text-gray-400 text-xs mt-2">Intenta ajustar los filtros de talla o color para encontrar lo que buscas.</p>
                   <button 
                    onClick={() => { setTallasSel([]); setColoresSel([]); setCategoriaSel('todos'); setBusqueda(''); }}
                    className="mt-6 px-6 py-2 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-full shadow-sm"
                  >
                    Restablecer Catálogo
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
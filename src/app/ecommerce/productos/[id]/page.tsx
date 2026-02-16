'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Loader2, Wand2, ChevronRight 
} from 'lucide-react';
import Link from 'next/link';
import { useCarrito } from '@/app/ecommerce/_contexts/CartContext';
import { useFavoritos } from '@/app/ecommerce/_contexts/FavoritosContext';
import ColorSelector from '@/components/ecommerce/productos/ColorSelector';
import TallaSelector from '@/components/ecommerce/productos/TallaSelector';
import { getSupabaseImageUrl } from '@/lib/utils/supabase-image-utils';

interface Variante {
  id: number;
  color: string;
  talla: string;
  precio_adicional: number;
  stock_adicional: number;
  sku: string;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  sku: string;
  stock: number;
  categoria_id: number;
  categoria: { id: number; nombre: string };
  variantes: Variante[];
  colores: string[];
  tallas: string[];
}

export default function PaginaDetallesProducto() {
  const params = useParams();
  const searchParams = useSearchParams();
  const productoId = params.id as string;
  const isCustomModeInitial = searchParams.get('mode') === 'custom';

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [colorSeleccionado, setColorSeleccionado] = useState<string | null>(null);
  const [tallaSeleccionada, setTallaSeleccionada] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(400);
  const [agregandoCarrito, setAgregandoCarrito] = useState(false);

  const [isCustomizing, setIsCustomizing] = useState(isCustomModeInitial);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [colorSimulado, setColorSimulado] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extraemos las funciones del carrito
  const { agregarAlCarrito, setIsCartOpen } = useCarrito();
  const CANTIDAD_MINIMA = 400;

  const [colorIA, setColorIA] = useState('#e2e8f0');

  useEffect(() => {
    const fetchProducto = async () => {
      if (!productoId) return;
      try {
        setLoading(true);
        const response = await fetch(`/api/ecommerce/productos/${productoId}`);
        if (!response.ok) throw new Error('Producto no encontrado');
        const { data } = await response.json();
        setProducto(data);
        if (data.colores?.length > 0) setColorSeleccionado(data.colores[0]);
        if (data.tallas?.length > 0) setTallaSeleccionada(data.tallas[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando producto');
      } finally {
        setLoading(false);
      }
    };
    fetchProducto();
  }, [productoId]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Función de agregar al carrito optimizada
  const handleAgregarCarrito = async () => {
    if (!producto) return;
    if (!colorSeleccionado || !tallaSeleccionada) return;

    setAgregandoCarrito(true);
    
    try {
      // Enviamos el objeto con la data de personalización si aplica
      agregarAlCarrito({
        ...producto,
        cantidad,
        color: colorSeleccionado,
        talla: tallaSeleccionada,
        // Si está en modo personalización, enviamos el color de la IA
        imagenIA: isCustomizing ? colorIA : null,
        logoCustom: isCustomizing ? logoPreview : null
      });

      setIsCartOpen(true);

    } catch (err) {
      console.error("Error al añadir:", err);
    } finally {
      setAgregandoCarrito(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-gray-400" size={40} />
    </div>
  );

  if (error || !producto) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <p className="text-red-500 mb-4 text-lg font-semibold">{error}</p>
      <Link href="/ecommerce/productos" className="font-bold text-blue-600 hover:underline">
        Volver al catálogo
      </Link>
    </div>
  );

  const imageUrl = getSupabaseImageUrl(producto.imagen) || '';
  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="max-w-7xl mx-auto px-6 py-4 text-xs text-gray-500 flex gap-2">
        <Link href="/ecommerce">Inicio</Link> <span>/</span>
        <Link href="/ecommerce/productos">Catálogo</Link> <span>/</span>
        <span className="text-black font-bold">{producto.nombre}</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Visualizador de Producto */}
          <div className="lg:col-span-7">
            <div className="sticky top-10 space-y-6">
              <div className="relative aspect-square bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-white">
                <motion.img
                  key={colorSimulado}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  src={imageUrl}
                  alt={producto.nombre}
                  className="w-full h-full object-cover transition-all duration-700"
                  style={{ 
                    filter: isCustomizing ? 'grayscale(100%) brightness(1.1)' : 'none'
                  }}
                />

                {/* CAPA DE IA: El color dinámico */}
                <AnimatePresence>
                  {isCustomizing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }} // Opacidad media para ver las sombras de abajo
                      className="absolute inset-0 z-10 pointer-events-none"
                      style={{ 
                        backgroundColor: colorIA,
                        mixBlendMode: 'multiply' // MAGIA CSS: Mantiene las texturas y sombras
                      }}
                    />
                  )}
                </AnimatePresence>
                  
                {/* Capa de Logo (Mantener como la tienes) */}
                <AnimatePresence>
                  {logoPreview && isCustomizing && (
                    <motion.div 
                      drag
                      dragConstraints={{ left: -150, right: 150, top: -150, bottom: 150 }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center z-20 cursor-move"
                    >
                      <img src={logoPreview} className="w-32 h-32 object-contain drop-shadow-2xl" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute top-8 left-8">
                  <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                    isCustomizing ? 'bg-rose-500 text-white' : 'bg-white text-black'
                  }`}>
                    {isCustomizing ? 'Modo Personalización' : 'Stock Mayorista'}
                  </span>
                </div>
              </div>
              {isCustomizing && (
                  <motion.div className="mt-6 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Paleta IA Personalizada</p>
                    <div className="flex flex-wrap gap-3">
                      {['#FF5555', '#55FF55', '#5555FF', '#FACC15', '#000000', '#FFFFFF'].map((hex) => (
                        <button
                          key={hex}
                          onClick={() => setColorIA(hex)}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                      {/* Selector Libre */}
                      <input 
                        type="color" 
                        value={colorIA}
                        onChange={(e) => setColorIA(e.target.value)}
                        className="w-10 h-10 rounded-full cursor-pointer overflow-hidden border-none"
                      />
                    </div>
                    <p className="mt-4 text-[11px] text-slate-500 italic">
                      * La visualización utiliza IA para simular el teñido textil sobre el tejido original.
                    </p>
                  </motion.div>
                )}

              {isCustomizing && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-black rounded-[2rem] text-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-2xl">
                      <Wand2 size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Añadir Identidad</p>
                      <p className="text-[10px] text-gray-400">Sube tu logo y ubícalo sobre la prenda</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-white text-black rounded-xl font-bold text-[10px] uppercase hover:bg-rose-500 hover:text-white transition-all"
                  >
                    Subir Logo
                  </button>
                  <input type="file" ref={fileInputRef} hidden onChange={handleLogoUpload} accept="image/*" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Información y Compra */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-rose-500 font-black text-xs uppercase tracking-widest">
                {producto.categoria?.nombre || 'General'}
              </span>
              <h1 className="text-5xl font-black text-slate-900 mt-2">{producto.nombre}</h1>
              <p className="text-slate-400 text-sm mt-2 font-mono">SKU: {producto.sku}</p>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-black text-slate-900">S/ {producto.precio.toFixed(2)}</span>
              <span className="text-slate-400 font-bold uppercase text-xs tracking-tighter">Precio x Volumen</span>
            </div>

            <p className="text-slate-600 leading-relaxed">{producto.descripcion}</p>

            <div className="h-px bg-slate-200" />

            {/* Selectores Dinámicos */}
            <ColorSelector 
              coloresDisponibles={producto.colores || []}
              colorSeleccionado={colorSeleccionado}
              onColorSeleccionado={(c) => { setColorSeleccionado(c); setColorSimulado(c); }}
            />

            <TallaSelector 
              tallasDisponibles={producto.tallas || []}
              tallaSeleccionada={tallaSeleccionada}
              onTallaSeleccionada={setTallaSeleccionada}
            />

            {/* Manejo de Cantidad B2B */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cantidad mínima (400 uds)</label>
              <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 w-fit">
                <button onClick={() => setCantidad(Math.max(CANTIDAD_MINIMA, cantidad - 100))} className="w-12 h-12 flex items-center justify-center font-bold hover:bg-slate-50 rounded-xl">-</button>
                <input 
                  type="number" 
                  value={cantidad} 
                  onChange={(e) => setCantidad(Math.max(CANTIDAD_MINIMA, parseInt(e.target.value) || CANTIDAD_MINIMA))}
                  className="w-20 text-center font-black text-lg focus:outline-none"
                />
                <button onClick={() => setCantidad(cantidad + 100)} className="w-12 h-12 flex items-center justify-center font-bold hover:bg-slate-50 rounded-xl">+</button>
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                Subtotal: <span className="text-slate-900">S/ {(producto.precio * cantidad).toLocaleString()}</span>
              </p>
            </div>

            {/* Acciones Finales */}
            <div className="flex gap-4">
              <button 
                onClick={handleAgregarCarrito}
                disabled={agregandoCarrito}
                className="flex-[3] bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-rose-600 transition-all flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50"
              >
                {agregandoCarrito ? <Loader2 className="animate-spin" /> : "Añadir a Carrito"}
              </button>
              <button 
                onClick={() => setIsCustomizing(!isCustomizing)}
                className={`flex-1 flex items-center justify-center rounded-3xl border-2 transition-all ${isCustomizing ? 'bg-rose-50 border-rose-500 text-rose-500' : 'border-slate-200 text-slate-400 hover:border-black'}`}
              >
                <Wand2 size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Sección de Recomendados */}
        <div className="mt-40 border-t pt-20">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black text-slate-900 italic">Relacionados</h2>
              <p className="text-slate-400 font-medium">Sugerencias para tu inventario</p>
            </div>
            <Link href="/ecommerce/productos" className="text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:text-rose-500 transition-colors">
              Catálogo completo <ChevronRight size={14}/>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="aspect-[3/4] bg-slate-100 rounded-[2rem] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
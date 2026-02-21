'use client';

import { useEffect, useState, useRef, useMemo, useCallback, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Loader2, Wand2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCarrito } from '@/app/ecommerce/_contexts/CartContext';
import ColorSelector from '@/components/ecommerce/productos/ColorSelector';
import TallaSelector from '@/components/ecommerce/productos/TallaSelector';
import { getSupabaseImageUrl } from '@/lib/utils/supabase-image-utils';

// ─── Tipos ────────────────────────────────────────────────────────────────────

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
  colores_disponibles: string[];
  tallas_disponibles: string[];
  tallas_por_color: Record<string, string[]>;
  colores_por_talla: Record<string, string[]>;
}

interface ProductoResumido {
  id: number;
  nombre: string;
  precio: number;
  imagen: string | null;
  colores_disponibles: string[];
  tallas_disponibles: string[];
}

// ─── Cache simple en memoria ──────────────────────────────────────────────────
const productCache = new Map<string, Producto>();

// ─── Colores IA predefinidos ──────────────────────────────────────────────────
const COLORES_IA = ['#FF5555', '#55FF55', '#5555FF', '#FACC15', '#000000', '#FFFFFF'];

const CANTIDAD_MINIMA = 400;

// ─── Card de producto relacionado ─────────────────────────────────────────────

function CardRelacionado({ producto }: { producto: ProductoResumido }) {
  const imageUrl = producto.imagen || '';

  return (
    <Link href={`/ecommerce/productos/${producto.id}`} className="group block">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative aspect-[3/4] bg-slate-100 rounded-[2rem] overflow-hidden shadow-sm group-hover:shadow-xl transition-shadow duration-300"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={producto.nombre}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
            <span className="text-slate-400 text-xs">Sin imagen</span>
          </div>
        )}

        {/* Overlay hover con colores disponibles */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <p className="text-white font-black text-sm leading-tight">{producto.nombre}</p>
          <p className="text-white/80 font-bold text-xs mt-1">S/ {producto.precio.toFixed(2)}</p>
          {producto.colores_disponibles?.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {producto.colores_disponibles.slice(0, 4).map((c) => (
                <span key={c} className="text-[9px] text-white/70 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {c}
                </span>
              ))}
              {producto.colores_disponibles.length > 4 && (
                <span className="text-[9px] text-white/70 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  +{producto.colores_disponibles.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Badge precio */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow">
          <span className="text-[11px] font-black text-slate-900">S/ {producto.precio.toFixed(2)}</span>
        </div>
      </motion.div>

      <div className="mt-3 px-1">
        <p className="text-xs font-bold text-slate-800 line-clamp-2 group-hover:text-rose-500 transition-colors">
          {producto.nombre}
        </p>
        {producto.tallas_disponibles?.length > 0 && (
          <p className="text-[10px] text-slate-400 mt-0.5">
            {producto.tallas_disponibles.join(' · ')}
          </p>
        )}
      </div>
    </Link>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string }>;
}

export default function PaginaDetallesProducto({ params }: Props) {
  const { id: productoId } = use(params);
  const searchParams = useSearchParams();
  const isCustomModeInitial = searchParams.get('mode') === 'custom';

  const [producto, setProducto] = useState<Producto | null>(
    () => productCache.get(productoId) ?? null
  );
  const [loading, setLoading] = useState(!productCache.has(productoId));
  const [error, setError] = useState<string | null>(null);

  // ── Relacionados ──
  const [relacionados, setRelacionados] = useState<ProductoResumido[]>([]);
  const [loadingRelacionados, setLoadingRelacionados] = useState(false);

  const [colorSeleccionado, setColorSeleccionado] = useState<string | null>(null);
  const [tallaSeleccionada, setTallaSeleccionada] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(CANTIDAD_MINIMA);
  const [agregandoCarrito, setAgregandoCarrito] = useState(false);

  const [isCustomizing, setIsCustomizing] = useState(isCustomModeInitial);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [colorIA, setColorIA] = useState('#e2e8f0');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { agregarAlCarrito, setIsCartOpen } = useCarrito();

  // ── Fetch producto ──
  useEffect(() => {
    if (productCache.has(productoId)) return;
    let cancelled = false;
    const fetchProducto = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/ecommerce/productos/${productoId}`, {
          next: { revalidate: 60 },
        } as RequestInit);
        if (!response.ok) throw new Error('Producto no encontrado');
        const { data } = await response.json();
        if (!cancelled) {
          productCache.set(productoId, data);
          setProducto(data);
          setColorSeleccionado(data.colores_disponibles?.[0] ?? null);
          setTallaSeleccionada(data.tallas_disponibles?.[0] ?? null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error cargando producto');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducto();
    return () => { cancelled = true; };
  }, [productoId]);

  // Defaults desde caché
  useEffect(() => {
    if (producto && !colorSeleccionado) {
      setColorSeleccionado(producto.colores_disponibles?.[0] ?? null);
      setTallaSeleccionada(producto.tallas_disponibles?.[0] ?? null);
    }
  }, [producto]);

  // ── Fetch relacionados por categoría ──
  useEffect(() => {
    if (!producto?.categoria_id) return;
    let cancelled = false;
    setLoadingRelacionados(true);

    const fetchRelacionados = async () => {
      try {
        // Pedimos 5 para garantizar 4 después de excluir el producto actual
        const res = await fetch(
          `/api/ecommerce/productos?categoria_id=${producto.categoria_id}&limite=5`
        );
        if (!res.ok) return;
        const { data } = await res.json();
        if (!cancelled) {
          setRelacionados(
            (data as ProductoResumido[])
              .filter((p) => p.id !== producto.id)
              .slice(0, 4)
          );
        }
      } catch {
        // Silencioso: los relacionados no bloquean la experiencia principal
      } finally {
        if (!cancelled) setLoadingRelacionados(false);
      }
    };

    fetchRelacionados();
    return () => { cancelled = true; };
  }, [producto?.categoria_id, producto?.id]);

  // ── Memos ──
  const imageUrl = useMemo(
    () => (producto ? (getSupabaseImageUrl(producto.imagen) || '') : ''),
    [producto?.imagen]
  );

  const { tallasAgotadas, coloresAgotados } = useMemo(() => {
    if (!producto) return { tallasAgotadas: [], coloresAgotados: [] };
    return {
      tallasAgotadas: colorSeleccionado
        ? producto.tallas_disponibles.filter(
            (t) => !producto.tallas_por_color[colorSeleccionado]?.includes(t)
          )
        : [],
      coloresAgotados: tallaSeleccionada
        ? producto.colores_disponibles.filter(
            (c) => !producto.colores_por_talla[tallaSeleccionada]?.includes(c)
          )
        : [],
    };
  }, [producto, colorSeleccionado, tallaSeleccionada]);

  const subtotal = useMemo(
    () => (producto ? producto.precio * cantidad : 0),
    [producto?.precio, cantidad]
  );

  // ── Callbacks ──
  const handleColorSeleccionado = useCallback(
    (color: string) => setColorSeleccionado((prev) => (prev === color ? null : color)), []
  );
  const handleTallaSeleccionada = useCallback(
    (talla: string) => setTallaSeleccionada((prev) => (prev === talla ? null : talla)), []
  );
  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);
  const handleAgregarCarrito = useCallback(async () => {
    if (!producto || !colorSeleccionado || !tallaSeleccionada) return;
    setAgregandoCarrito(true);
    try {
      agregarAlCarrito({
        ...producto, cantidad, color: colorSeleccionado, talla: tallaSeleccionada,
        imagenIA: isCustomizing ? colorIA : null,
        logoCustom: isCustomizing ? logoPreview : null,
      });
      setIsCartOpen(true);
    } catch (err) {
      console.error('Error al añadir:', err);
    } finally {
      setAgregandoCarrito(false);
    }
  }, [producto, colorSeleccionado, tallaSeleccionada, cantidad, isCustomizing, colorIA, logoPreview]);
  const handleCantidadDecremento = useCallback(() => setCantidad((p) => Math.max(CANTIDAD_MINIMA, p - 100)), []);
  const handleCantidadIncremento = useCallback(() => setCantidad((p) => p + 100), []);
  const handleCantidadInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCantidad(Math.max(CANTIDAD_MINIMA, parseInt(e.target.value) || CANTIDAD_MINIMA));
  }, []);
  const handleToggleCustomizing = useCallback(() => setIsCustomizing((p) => !p), []);

  // ── Guards ──
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-gray-400" size={40} />
    </div>
  );
  if (error || !producto) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <p className="text-red-500 mb-4 text-lg font-semibold">{error}</p>
      <Link href="/ecommerce/productos" className="font-bold text-blue-600 hover:underline">Volver al catálogo</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/30">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4 text-xs text-gray-500 flex gap-2">
        <Link href="/ecommerce">Inicio</Link> <span>/</span>
        <Link href="/ecommerce/productos">Catálogo</Link> <span>/</span>
        <span className="text-black font-bold">{producto.nombre}</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* ── Visualizador ── */}
          <div className="lg:col-span-7">
            <div className="sticky top-10 space-y-6">
              <div className="relative aspect-square bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-white">
                <Image src={imageUrl} alt={producto.nombre} fill priority
                  sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover"
                  style={{ filter: isCustomizing ? 'grayscale(100%) brightness(1.1)' : 'none', transition: 'filter 0.7s ease' }}
                />
                <AnimatePresence>
                  {isCustomizing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 pointer-events-none"
                      style={{ backgroundColor: colorIA, mixBlendMode: 'multiply' }}
                    />
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {logoPreview && isCustomizing && (
                    <motion.div drag dragConstraints={{ left: -150, right: 150, top: -150, bottom: 150 }}
                      initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute inset-0 flex items-center justify-center z-20 cursor-move"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoPreview} className="w-32 h-32 object-contain drop-shadow-2xl" alt="Logo" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="absolute top-8 left-8 z-30">
                  <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${isCustomizing ? 'bg-rose-500 text-white' : 'bg-white text-black'}`}>
                    {isCustomizing ? 'Modo Personalización' : 'Stock Mayorista'}
                  </span>
                </div>
              </div>

              <AnimatePresence>
                {isCustomizing && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm"
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Paleta IA Personalizada</p>
                    <div className="flex flex-wrap gap-3">
                      {COLORES_IA.map((hex) => (
                        <button key={hex} onClick={() => setColorIA(hex)}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                      <input type="color" value={colorIA} onChange={(e) => setColorIA(e.target.value)}
                        className="w-10 h-10 rounded-full cursor-pointer overflow-hidden border-none"
                      />
                    </div>
                    <p className="mt-4 text-[11px] text-slate-500 italic">* La visualización utiliza IA para simular el teñido textil sobre el tejido original.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isCustomizing && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="p-6 bg-black rounded-[2rem] text-white flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-2xl"><Wand2 size={24} /></div>
                      <div>
                        <p className="text-sm font-bold">Añadir Identidad</p>
                        <p className="text-[10px] text-gray-400">Sube tu logo y ubícalo sobre la prenda</p>
                      </div>
                    </div>
                    <button onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-white text-black rounded-xl font-bold text-[10px] uppercase hover:bg-rose-500 hover:text-white transition-all"
                    >Subir Logo</button>
                    <input type="file" ref={fileInputRef} hidden onChange={handleLogoUpload} accept="image/*" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Info y compra ── */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-rose-500 font-black text-xs uppercase tracking-widest">{producto.categoria?.nombre || 'General'}</span>
              <h1 className="text-5xl font-black text-slate-900 mt-2">{producto.nombre}</h1>
              <p className="text-slate-400 text-sm mt-2 font-mono">SKU: {producto.sku}</p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-black text-slate-900">S/ {producto.precio.toFixed(2)}</span>
              <span className="text-slate-400 font-bold uppercase text-xs tracking-tighter">Precio x Volumen</span>
            </div>
            <p className="text-slate-600 leading-relaxed">{producto.descripcion}</p>
            <div className="h-px bg-slate-200" />

            <ColorSelector
              coloresDisponibles={producto.colores_disponibles || []}
              colorSeleccionado={colorSeleccionado}
              onColorSeleccionado={handleColorSeleccionado}
              coloresAgotados={coloresAgotados}
            />
            <TallaSelector
              tallasDisponibles={producto.tallas_disponibles || []}
              tallaSeleccionada={tallaSeleccionada}
              onTallaSeleccionada={handleTallaSeleccionada}
              tallasAgotadas={tallasAgotadas}
            />

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cantidad mínima (400 uds)</label>
              <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 w-fit">
                <button onClick={handleCantidadDecremento} className="w-12 h-12 flex items-center justify-center font-bold hover:bg-slate-50 rounded-xl">-</button>
                <input type="number" value={cantidad} onChange={handleCantidadInput} className="w-20 text-center font-black text-lg focus:outline-none" />
                <button onClick={handleCantidadIncremento} className="w-12 h-12 flex items-center justify-center font-bold hover:bg-slate-50 rounded-xl">+</button>
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                Subtotal: <span className="text-slate-900">S/ {subtotal.toLocaleString()}</span>
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAgregarCarrito}
                disabled={agregandoCarrito || !colorSeleccionado || !tallaSeleccionada}
                className="flex-[3] bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-rose-600 transition-all flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {agregandoCarrito ? <Loader2 className="animate-spin" size={18} /> : <><ShoppingCart size={16} /> Añadir a Carrito</>}
              </button>
              <button onClick={handleToggleCustomizing}
                className={`flex-1 flex items-center justify-center rounded-3xl border-2 transition-all ${isCustomizing ? 'bg-rose-50 border-rose-500 text-rose-500' : 'border-slate-200 text-slate-400 hover:border-black'}`}
              >
                <Wand2 size={24} />
              </button>
            </div>

            <AnimatePresence>
              {(!colorSeleccionado || !tallaSeleccionada) && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-[11px] text-amber-500 font-semibold"
                >
                  {!colorSeleccionado && !tallaSeleccionada
                    ? 'Selecciona un color y una talla para continuar.'
                    : !colorSeleccionado ? 'Selecciona un color para continuar.'
                    : 'Selecciona una talla para continuar.'}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Relacionados por categoría ── */}
        <div className="mt-40 border-t pt-20">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-1">
                {producto.categoria?.nombre || 'Categoría'}
              </p>
              <h2 className="text-4xl font-black text-slate-900">Relacionados</h2>
              <p className="text-slate-400 font-medium mt-1">Más prendas de la misma categoría</p>
            </div>
            <Link
              href={`/ecommerce/productos?categoria_id=${producto.categoria_id}`}
              className="text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:text-rose-500 transition-colors"
            >
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>

          {loadingRelacionados ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[3/4] bg-slate-100 rounded-[2rem] animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded-full animate-pulse w-3/4" />
                  <div className="h-2 bg-slate-100 rounded-full animate-pulse w-1/2" />
                </div>
              ))}
            </div>
          ) : relacionados.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relacionados.map((p) => (
                <CardRelacionado key={p.id} producto={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <p className="font-bold">No hay más productos en esta categoría.</p>
              <Link href="/ecommerce/productos"
                className="text-xs font-black uppercase tracking-widest text-rose-500 hover:underline mt-2 inline-block"
              >
                Ver catálogo completo
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
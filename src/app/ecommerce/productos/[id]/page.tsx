'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Heart, Share2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCarrito } from '@/app/ecommerce/_contexts/CartContext';
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
  stock_minimo: number;
  categoria_id: number;
  categoria: { id: number; nombre: string };
  variantes: Variante[];
  colores: string[];
  tallas: string[];
  created_at: string;
  updated_at: string;
}

export default function PaginaDetallesProducto() {
  const params = useParams();
  const productoId = params.id as string;

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [colorSeleccionado, setColorSeleccionado] = useState<string | null>(null);
  const [tallaSeleccionada, setTallaSeleccionada] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [agregandoCarrito, setAgregandoCarrito] = useState(false);

  const { agregarAlCarrito } = useCarrito();

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/ecommerce/productos/${productoId}`);

        if (!response.ok) {
          throw new Error('Producto no encontrado');
        }

        const data = await response.json();
        setProducto(data.data);

        // Pre-seleccionar primer color y talla
        if (data.data.colores.length > 0) {
          setColorSeleccionado(data.data.colores[0]);
        }
        if (data.data.tallas.length > 0) {
          setTallaSeleccionada(data.data.tallas[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando producto');
        console.error('[PRODUCTO_DETALLE] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [productoId]);

  const handleAgregarCarrito = async () => {
    if (!colorSeleccionado || !tallaSeleccionada) {
      alert('Por favor selecciona color y talla');
      return;
    }

    setAgregandoCarrito(true);

    try {
      // Agregar al carrito con opciones
      agregarAlCarrito({
        ...producto,
        cantidad,
        color: colorSeleccionado,
        talla: tallaSeleccionada,
      });

      // Mostrar confirmación
      alert(`${cantidad} ${producto?.nombre} agregado(s) al carrito`);
    } catch (err) {
      console.error('Error agregando carrito:', err);
      alert('Error al agregar al carrito');
    } finally {
      setAgregandoCarrito(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-gray-400" size={40} />
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-lg">{error || 'Producto no encontrado'}</p>
          <Link href="/ecommerce/productos" className="text-blue-600 hover:text-blue-700 font-semibold">
            ← Volver a productos
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = getSupabaseImageUrl(producto.imagen) || producto.imagen;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/ecommerce" className="hover:text-gray-900">
            Inicio
          </Link>
          <span>→</span>
          <Link href="/ecommerce/productos" className="hover:text-gray-900">
            Productos
          </Link>
          <span>→</span>
          <Link
            href={`/ecommerce/categorias/${producto.categoria_id}`}
            className="hover:text-gray-900"
          >
            {producto.categoria.nombre}
          </Link>
          <span>→</span>
          <span className="text-gray-900 font-semibold">{producto.nombre}</span>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          href="/ecommerce/productos"
          as={Link}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition"
        >
          <ArrowLeft size={20} />
          Volver
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Imagen del Producto */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={producto.nombre}
                className="w-full h-full object-cover max-h-[500px]"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center text-gray-400 text-sm uppercase">
                Sin imagen disponible
              </div>
            )}
          </motion.div>

          {/* Información del Producto */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Categoría */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase">
                {producto.categoria.nombre}
              </span>
            </div>

            {/* Título */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {producto.nombre}
            </h1>

            {/* Precio */}
            <div className="mb-6">
              <p className="text-5xl font-black text-gray-900">
                S/ {producto.precio.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500 mt-2">SKU: {producto.sku}</p>
            </div>

            {/* Descripción */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Descripción</h3>
              <p className="text-gray-700 leading-relaxed text-base">
                {producto.descripcion || 'No hay descripción disponible para este producto.'}
              </p>
            </div>

            {/* Selector de Color */}
            <ColorSelector
              coloresDisponibles={producto.colores}
              colorSeleccionado={colorSeleccionado}
              onColorSeleccionado={setColorSeleccionado}
            />

            {/* Selector de Talla */}
            <TallaSelector
              tallasDisponibles={producto.tallas}
              tallaSeleccionada={tallaSeleccionada}
              onTallaSeleccionada={setTallaSeleccionada}
            />

            {/* Cantidad */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                📦 Cantidad
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-semibold"
                >
                  −
                </button>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  onClick={() => setCantidad(cantidad + 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-semibold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock */}
            <div className="mb-8">
              <p className={`text-sm font-semibold ${producto.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {producto.stock > 0 ? `✓ ${producto.stock} unidades en stock` : '✗ Agotado'}
              </p>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={handleAgregarCarrito}
                disabled={agregandoCarrito || producto.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wide hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={20} />
                {agregandoCarrito ? 'Agregando...' : 'Agregar al Carrito'}
              </button>

              <button className="flex items-center justify-center gap-2 border-2 border-gray-300 px-6 py-4 rounded-lg font-bold uppercase tracking-wide hover:bg-gray-50 transition">
                <Heart size={20} />
                Favorito
              </button>

              <button className="flex items-center justify-center gap-2 border-2 border-gray-300 px-6 py-4 rounded-lg font-bold uppercase tracking-wide hover:bg-gray-50 transition">
                <Share2 size={20} />
                Compartir
              </button>
            </div>

            {/* Información Adicional */}
            <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-600 text-sm mb-1">📦 Envío</p>
                <p className="font-semibold text-gray-900">Gratis +S/ 299</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">🔒 Seguridad</p>
                <p className="font-semibold text-gray-900">100% Seguro</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">↩️ Devolución</p>
                <p className="font-semibold text-gray-900">30 días</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

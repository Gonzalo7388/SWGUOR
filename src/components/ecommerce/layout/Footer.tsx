'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Mail, Heart } from 'lucide-react';

export default function PiePagina() {
  const categorias = [
    { id: 1, nombre: 'Vestidos' },
    { id: 2, nombre: 'Blusas' },
    { id: 3, nombre: 'Pantalones' },
    { id: 4, nombre: 'Faldas' },
    { id: 5, nombre: 'Accesorios' },
    { id: 6, nombre: 'Buzos' },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 mt-20">
      {/* Sección Newsletter */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-lg">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Mail size={24} /> Suscríbete a nuestro Boletín
            </h3>
            <p className="text-red-100 text-sm mb-4">
              Recibe ofertas exclusivas, descuentos especiales y novedades de moda cada semana
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-grow px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white transition"
              />
              <button className="bg-gray-900 hover:bg-gray-800 px-6 py-3 rounded-lg font-semibold transition duration-300 whitespace-nowrap">
                Suscribir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pie Principal */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Logo y Acerca de */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.png"
                  alt="SWGUOR"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <h4 className="text-white font-bold">SWGUOR</h4>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Ropa de moda de calidad para mujeres. Somos tu tienda en línea de confianza.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-red-600 p-2 rounded-full transition duration-300"
                title="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-red-600 p-2 rounded-full transition duration-300"
                title="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-red-600 p-2 rounded-full transition duration-300"
                title="Twitter"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              👗 Categorías
            </h4>
            <ul className="space-y-2 text-sm">
              {categorias.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/ecommerce/categorias/${cat.id}`}
                    className="hover:text-red-500 transition duration-300 flex items-center gap-1"
                  >
                    <span className="text-red-500">›</span> {cat.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicio al Cliente */}
          <div>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              💬 Servicio al Cliente
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/ecommerce/contacto" className="hover:text-red-500 transition duration-300 flex items-center gap-1">
                  <span className="text-red-500">›</span> Contacto
                </Link>
              </li>
              <li>
                <Link href="/ecommerce/faq" className="hover:text-red-500 transition duration-300 flex items-center gap-1">
                  <span className="text-red-500">›</span> Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/ecommerce/devoluciones" className="hover:text-red-500 transition duration-300 flex items-center gap-1">
                  <span className="text-red-500">›</span> Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/ecommerce/envios" className="hover:text-red-500 transition duration-300 flex items-center gap-1">
                  <span className="text-red-500">›</span> Envíos
                </Link>
              </li>
              <li>
                <Link href="/ecommerce/rastrear" className="hover:text-red-500 transition duration-300 flex items-center gap-1">
                  <span className="text-red-500">›</span> Rastrear Pedido
                </Link>
              </li>
            </ul>
          </div>

          {/* Información Legal */}
          <div>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              ⚖️ Información
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/ecommerce/terminos" className="hover:text-red-500 transition duration-300 flex items-center gap-1">
                  <span className="text-red-500">›</span> Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/ecommerce/privacidad" className="hover:text-red-500 transition duration-300 flex items-center gap-1">
                  <span className="text-red-500">›</span> Privacidad
                </Link>
              </li>
              <li>
                <Link href="/ecommerce/nosotros" className="hover:text-red-500 transition duration-300 flex items-center gap-1">
                  <span className="text-red-500">›</span> Acerca de Nosotros
                </Link>
              </li>
              <li>
                <Link href="/ecommerce/blog" className="hover:text-red-500 transition duration-300 flex items-center gap-1">
                  <span className="text-red-500">›</span> Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Información de Contacto */}
          <div>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              📞 Contacta con Nosotros
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">📧</span>
                <div>
                  <p className="text-gray-400">Email</p>
                  <p className="text-white">info@swguor.com</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">📱</span>
                <div>
                  <p className="text-gray-400">Teléfono</p>
                  <p className="text-white">+56 9 XXXX XXXX</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">📍</span>
                <div>
                  <p className="text-gray-400">Ubicación</p>
                  <p className="text-white">Santiago, Chile</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-700" />

        {/* Pie */}
        <div className="py-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 gap-4">
          <p>&copy; 2026 SWGUOR. Todos los derechos reservados. Hecho con <Heart size={14} className="inline text-red-600" /> en Chile.</p>
          <div className="flex gap-6 flex-wrap justify-center">
            <span className="flex items-center gap-1">💳 Tarjeta</span>
            <span className="flex items-center gap-1">🏦 Transferencia</span>
            <span className="flex items-center gap-1">💰 Efectivo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

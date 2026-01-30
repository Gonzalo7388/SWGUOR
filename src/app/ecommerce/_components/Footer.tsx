'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';

export default function PiePagina() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      {/* Sección Newsletter */}
      <div className="bg-red-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-md">
            <h3 className="text-xl font-bold mb-2">Suscríbete a nuestro Boletín</h3>
            <p className="text-sm mb-4">Recibe ofertas exclusivas y descuentos especiales</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Tu correo"
                className="grow px-4 py-2 rounded text-gray-900 focus:outline-none"
              />
              <button className="bg-gray-900 hover:bg-gray-800 px-6 py-2 rounded font-medium transition">
                Suscribir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pie Principal */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Acerca de */}
          <div>
            <h4 className="text-white font-bold mb-4">Acerca de SWGUOR</h4>
            <p className="text-sm text-gray-400">
              Somos una empresa especializada en ropa de moda para mujeres, con productos de calidad y a los mejores precios.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="hover:text-red-600 transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-red-600 transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-red-600 transition">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h4 className="text-white font-bold mb-4">Categorías</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-red-600 transition">Vestidos</Link></li>
              <li><Link href="#" className="hover:text-red-600 transition">Blusas</Link></li>
              <li><Link href="#" className="hover:text-red-600 transition">Pantalones</Link></li>
              <li><Link href="#" className="hover:text-red-600 transition">Faldas</Link></li>
              <li><Link href="#" className="hover:text-red-600 transition">Accesorios</Link></li>
            </ul>
          </div>

          {/* Servicio al Cliente */}
          <div>
            <h4 className="text-white font-bold mb-4">Servicio al Cliente</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-red-600 transition">Contacto</Link></li>
              <li><Link href="#" className="hover:text-red-600 transition">Preguntas Frecuentes</Link></li>
              <li><Link href="#" className="hover:text-red-600 transition">Política de Devoluciones</Link></li>
              <li><Link href="#" className="hover:text-red-600 transition">Envíos</Link></li>
              <li><Link href="#" className="hover:text-red-600 transition">Rastrear Pedido</Link></li>
            </ul>
          </div>

          {/* Información */}
          <div>
            <h4 className="text-white font-bold mb-4">Información</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-red-600 transition">Términos y Condiciones</Link></li>
              <li><Link href="#" className="hover:text-red-600 transition">Política de Privacidad</Link></li>
              <li><Link href="#" className="hover:text-red-600 transition">Acerca de Nosotros</Link></li>
              <li><Link href="#" className="hover:text-red-600 transition">Blog</Link></li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-700 my-8" />

        {/* Pie */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; 2026 SWGUOR. Todos los derechos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span>Métodos de pago:</span>
            <div className="flex gap-2">
              <span>💳 Tarjeta</span>
              <span>📱 Transferencia</span>
              <span>💰 Efectivo</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

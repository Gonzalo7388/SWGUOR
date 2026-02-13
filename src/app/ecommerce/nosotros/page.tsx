'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaginaNosotros() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: '',
  });

  const [enviando, setEnviando] = useState(false);
  const [respuesta, setRespuesta] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setRespuesta(null);

    try {
      // Si tienes un endpoint de correo, úsalo aquí
      // Por ahora simularemos el envío
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setRespuesta({
        tipo: 'exito',
        mensaje: 'Gracias por tu mensaje. Nos pondremos en contacto pronto.',
      });

      setFormData({
        nombre: '',
        email: '',
        asunto: '',
        mensaje: '',
      });
    } catch (error) {
      setRespuesta({
        tipo: 'error',
        mensaje: 'Ocurrió un error. Por favor intenta de nuevo.',
      });
    } finally {
      setEnviando(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-600 via-purple-700 to-purple-800 text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-0"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-0"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Nosotros</h1>
            <p className="text-purple-100 text-lg md:text-xl mb-6">
              Conoce la historia y los valores de Modas y Estilos GUOR
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/ecommerce"
                className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                ← Ir a Inicio
              </Link>
              <Link
                href="/ecommerce/productos"
                className="px-6 py-3 bg-purple-900 text-white rounded-lg font-semibold hover:bg-purple-950 transition"
              >
                Explorar Productos
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Sección: Quiénes Somos */}
        <motion.section 
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">¿Quiénes Somos?</h2>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                <span className="font-bold text-purple-600">Modas y Estilos GUOR S.A.C</span> es una empresa textil dedicada al rubro de confección y venta mayorista de prendas para mujeres.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Contamos con una trayectoria sólida en el mercado, ofreciendo productos de alta calidad con diseños modernos y tendencias actuales. Nuestro compromiso es brindar prendas elegantes y accesibles para todas nuestras clientas.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Actualmente, nuestros procesos de pedidos, producción y administración funcionan de manera organizada, con herramientas especializadas para gestionar inventario, pedidos y relación con nuestros clientes mayoristas y proveedores de talleres externos y telas.
              </p>
            </div>
          </motion.div>

          {/* Cards de Visión y Misión */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Misión */}
            <motion.div 
              variants={itemVariants}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition"
            >
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Misión</h3>
              <p className="text-gray-700 leading-relaxed">
                Ser la mejor empresa textil en confección y venta mayorista de prendas para mujeres, proporcionando productos de excelente calidad, diseños innovadores y un servicio personalizado a nuestros clientes. Buscamos optimizar nuestros procesos mediante tecnología digital para agilizar la gestión de pedidos, inventario y relaciones comerciales.
              </p>
            </motion.div>

            {/* Visión */}
            <motion.div 
              variants={itemVariants}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition"
            >
              <div className="text-4xl mb-4">👁️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Visión</h3>
              <p className="text-gray-700 leading-relaxed">
                Ser reconocidos como líderes en la industria textil peruana, destacando por nuestra calidad, innovación y compromiso con la sostenibilidad. Implementar sistemas digitales avanzados que permitan una gestión integral de nuestros procesos y fortalecer nuestras relaciones con clientes y proveedores a nivel nacional e internacional.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Sección: Valores */}
        <motion.section 
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Nuestros Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icono: '✨', titulo: 'Calidad', desc: 'Excelencia en cada prenda' },
                { icono: '🤝', titulo: 'Integridad', desc: 'Transparencia en nuestras acciones' },
                { icono: '🚀', titulo: 'Innovación', desc: 'Diseños modernos y tendencias' },
                { icono: '💚', titulo: 'Responsabilidad', desc: 'Compromiso con el medio ambiente' },
              ].map((valor, idx) => (
                <motion.div 
                  key={idx}
                  variants={itemVariants}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center hover:shadow-md transition"
                >
                  <div className="text-4xl mb-3">{valor.icono}</div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">{valor.titulo}</h4>
                  <p className="text-gray-600 text-sm">{valor.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* Sección: Contacto y Formulario */}
        <motion.section 
          className="mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">¿Tienes Preguntas?</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información de contacto */}
            <motion.div variants={itemVariants}>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-full">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Contacto Directo</h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Mail className="text-purple-600 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <p className="text-gray-600">
                        <a href="mailto:contacto@guor.com" className="hover:text-purple-600">
                          contacto@guor.com
                        </a>
                      </p>
                      <p className="text-gray-600">
                        <a href="mailto:ventas@guor.com" className="hover:text-purple-600">
                          ventas@guor.com
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="text-purple-600 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <p className="font-semibold text-gray-900">Contacto Mayorista</p>
                      <p className="text-gray-600">
                        <a href="https://wa.me/51" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600">
                          WhatsApp Business
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="text-purple-600 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <p className="font-semibold text-gray-900">Ubicación</p>
                      <p className="text-gray-600">Lima, Perú</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Formulario de contacto */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Enviar Mensaje</h3>

                {respuesta && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg mb-6 flex items-start gap-3 ${
                      respuesta.tipo === 'exito'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    {respuesta.tipo === 'exito' ? (
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    ) : (
                      <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    )}
                    <p
                      className={
                        respuesta.tipo === 'exito' ? 'text-green-800' : 'text-red-800'
                      }
                    >
                      {respuesta.mensaje}
                    </p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Asunto
                    </label>
                    <select
                      name="asunto"
                      value={formData.asunto}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="">Selecciona un asunto</option>
                      <option value="consulta">Consulta General</option>
                      <option value="mayorista">Solicitud Mayorista</option>
                      <option value="socios">Oportunidad de Negocios</option>
                      <option value="proveedores">Información de Proveedores</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Mensaje
                    </label>
                    <textarea
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                      placeholder="Cuéntanos cómo podemos ayudarte..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Send size={20} />
                    {enviando ? 'Enviando...' : 'Enviar Mensaje'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

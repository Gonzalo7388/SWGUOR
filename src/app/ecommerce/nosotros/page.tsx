'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Heart } from 'lucide-react';
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
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setRespuesta({
        tipo: 'exito',
        mensaje: '✓ Gracias por tu mensaje. Nos pondremos en contacto pronto.',
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
        mensaje: '✗ Ocurrió un error. Por favor intenta de nuevo.',
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-primary-50/30">
      {/* Header Premium */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600 py-20 md:py-28 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40 -z-0"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-0"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                <Heart className="text-white" size={32} />
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">Sobre Nosotros</h1>
            </div>
            <p className="text-primary-100 text-lg md:text-xl mb-0 max-w-3xl font-light leading-relaxed">
              Descubre la historia, visión y valores de Modas y Estilos GUOR - Empresa líder en confección textil
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contenido Principal */}
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
            <h2 className="text-4xl md:text-5xl font-black text-gray-950 mb-8 flex items-center gap-4">
              <div className="h-1 w-16 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full"></div>
              ¿Quiénes Somos?
            </h2>
            <div className="bg-gradient-to-br from-white to-primary-50 border-2 border-primary-200 p-10 rounded-3xl hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                <span className="font-bold text-primary-700 text-xl">Modas y Estilos GUOR S.A.C</span> es una empresa textil de excelencia dedicada al rubro de confección y venta mayorista de prendas para mujeres con más de una década de trayectoria en el mercado.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Contamos con una trayectoria sólida y certificada, ofreciendo productos de alta calidad con diseños modernos y tendencias actuales. Nuestro compromiso es brindar prendas elegantes, accesibles y sostenibles para todas nuestras clientas.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Actualmente, nuestros procesos de pedidos, producción y administración funcionan con máxima eficiencia, utilizando herramientas tecnológicas especializadas para gestionar inventario, pedidos y relaciones estratégicas con nuestros clientes mayoristas y proveedores nacionales.
              </p>
            </div>
          </motion.div>

          {/* Cards de Visión y Misión */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Misión */}
            <motion.div 
              variants={itemVariants}
              className="group relative bg-white border border-gray-200 p-10 rounded-3xl hover:shadow-2xl hover:border-primary-300 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-600/5 rounded-full blur-3xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg transition-all duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-950 mb-4">Misión</h3>
                <p className="text-gray-600 text-lg leading-relaxed font-light">
                  Ser la empresa textil líder en confección y venta mayorista de prendas para mujeres, proporcionando productos de excelente calidad, diseños innovadores y atención personalizada a cada cliente.
                </p>
              </div>
            </motion.div>

            {/* Visión */}
            <motion.div 
              variants={itemVariants}
              className="group relative bg-white border border-gray-200 p-10 rounded-3xl hover:shadow-2xl hover:border-accent-300 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent-600/5 rounded-full blur-3xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-accent-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-600 to-accent-700 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg transition-all duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-950 mb-4">Visión</h3>
                <p className="text-gray-600 text-lg leading-relaxed font-light">
                  Ser reconocidos como empresa de clase mundial en la industria textil peruana, destacando por nuestra calidad, innovación sostenible y compromiso con el bienestar de nuestros stakeholders.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Sección: Valores */}
        <motion.section 
          className="mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-950 mb-8 flex items-center gap-4">
              <div className="h-1 w-16 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full"></div>
              Nuestros Valores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: 'sparkles', titulo: 'Calidad', desc: 'Excelencia en cada prenda que confeccionamos', color: 'primary' },
                { icon: 'handshake', titulo: 'Integridad', desc: 'Transparencia total en nuestras acciones', color: 'primary' },
                { icon: 'rocket', titulo: 'Innovación', desc: 'Diseños modernos y tendencias actuales', color: 'accent' },
                { icon: 'leaf', titulo: 'Responsabilidad', desc: 'Compromiso con sostenibilidad ambiental', color: 'accent' },
              ].map((valor, idx) => {
                const iconMap = {
                  sparkles: <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
                  handshake: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
                  rocket: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
                  leaf: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
                };
                
                return (
                  <motion.div 
                    key={idx}
                    variants={itemVariants}
                    className="group relative bg-white border border-gray-200 p-8 rounded-3xl hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${
                        valor.color === 'primary' 
                          ? 'bg-gradient-to-br from-primary-100 to-primary-50 text-primary-700 group-hover:from-primary-600 group-hover:to-primary-700 group-hover:text-white group-hover:shadow-lg' 
                          : 'bg-gradient-to-br from-accent-100 to-accent-50 text-accent-700 group-hover:from-accent-600 group-hover:to-accent-700 group-hover:text-white group-hover:shadow-lg'
                      }`}>
                        {iconMap[valor.icon as keyof typeof iconMap]}
                      </div>
                      <h4 className="font-bold text-gray-950 text-lg mb-3">{valor.titulo}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed font-light">{valor.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
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
          <h2 className="text-4xl md:text-5xl font-black text-gray-950 mb-12 text-center flex items-center justify-center gap-4">
            <div className="h-1 w-16 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full"></div>
            ¿Tienes Preguntas?
            <div className="h-1 w-16 bg-gradient-to-r from-accent-600 to-primary-600 rounded-full"></div>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información de contacto */}
            <motion.div variants={itemVariants}>
              <div className="bg-gradient-to-br from-white to-primary-50 border-2 border-primary-300 p-10 rounded-3xl h-full hover:shadow-xl hover:border-primary-400 transition-all duration-300">
                <h3 className="text-2xl font-bold text-gray-950 mb-8">Contacto Directo</h3>

                <div className="space-y-7">
                  <div className="flex items-start gap-4 group">
                    <div className="p-3 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors duration-300">
                      <Mail className="text-primary-700" size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-950 mb-1">Email</p>
                      <p className="text-gray-600 text-sm mb-1">
                        <a href="mailto:contacto@guor.com" className="hover:text-primary-700 transition-colors font-medium">
                          contacto@guor.com
                        </a>
                      </p>
                      <p className="text-gray-600 text-sm">
                        <a href="mailto:ventas@guor.com" className="hover:text-primary-700 transition-colors font-medium">
                          ventas@guor.com
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="p-3 bg-accent-100 rounded-xl group-hover:bg-accent-200 transition-colors duration-300">
                      <Phone className="text-accent-700" size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-950 mb-1">Contacto Mayorista</p>
                      <p className="text-gray-600 text-sm">
                        <a href="https://wa.me/51" target="_blank" rel="noopener noreferrer" className="hover:text-accent-700 transition-colors font-medium">
                          WhatsApp Business
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="p-3 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors duration-300">
                      <MapPin className="text-primary-700" size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-950 mb-1">Ubicación</p>
                      <p className="text-gray-600 text-sm font-medium">Lima, Perú</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Formulario de contacto */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="bg-gradient-to-br from-white to-accent-50 border-2 border-accent-300 p-10 rounded-3xl hover:shadow-xl hover:border-accent-400 transition-all duration-300">
                <h3 className="text-2xl font-bold text-gray-950 mb-8">Enviar Mensaje</h3>

                {respuesta && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl mb-6 flex items-start gap-3 ${
                      respuesta.tipo === 'exito'
                        ? 'bg-green-50 border-2 border-green-300'
                        : 'bg-red-50 border-2 border-red-300'
                    }`}
                  >
                    {respuesta.tipo === 'exito' ? (
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    ) : (
                      <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    )}
                    <p
                      className={
                        respuesta.tipo === 'exito' ? 'text-green-800 font-semibold' : 'text-red-800 font-semibold'
                      }
                    >
                      {respuesta.mensaje}
                    </p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-950 mb-2">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-accent-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-950 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-accent-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-950 mb-2">
                      Asunto
                    </label>
                    <select
                      name="asunto"
                      value={formData.asunto}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-accent-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all"
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
                    <label className="block text-sm font-bold text-gray-950 mb-2">
                      Mensaje
                    </label>
                    <textarea
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-accent-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all resize-none"
                      placeholder="Cuéntanos cómo podemos ayudarte..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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

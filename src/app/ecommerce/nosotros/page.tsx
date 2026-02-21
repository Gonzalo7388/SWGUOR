'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      delay: i * 0.08,
    },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setRespuesta(null);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setRespuesta({ tipo: 'exito', mensaje: 'Gracias por tu mensaje. Nos pondremos en contacto pronto.' });
      setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
    } catch {
      setRespuesta({ tipo: 'error', mensaje: 'Ocurrió un error. Por favor intenta de nuevo.' });
    } finally {
      setEnviando(false);
    }
  };

  const valores = [
    { num: '01', titulo: 'Calidad', desc: 'Excelencia en cada prenda que confeccionamos, desde el corte hasta el acabado final.' },
    { num: '02', titulo: 'Integridad', desc: 'Transparencia total en nuestras acciones y relaciones comerciales.' },
    { num: '03', titulo: 'Innovación', desc: 'Diseños modernos alineados con las tendencias globales de moda.' },
    { num: '04', titulo: 'Responsabilidad', desc: 'Compromiso firme con la sostenibilidad ambiental y social.' },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── HERO ── */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-20 md:py-28">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p
              variants={fadeUp}
              className="text-[10px] font-semibold uppercase tracking-[0.5em] text-gray-400 mb-6"
            >
              Modas y Estilos GUOR · Desde 2013
            </motion.p>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl md:text-6xl font-light text-gray-900 leading-tight tracking-tight mb-6 max-w-3xl"
            >
              Empresa textil dedicada a la{' '}
              <span className="font-semibold">excelencia</span>{' '}
              en moda femenina.
            </motion.h1>
            <motion.div variants={fadeUp} custom={2} className="w-12 h-px bg-gray-300" />
          </motion.div>
        </div>
      </section>

      {/* ── QUIÉNES SOMOS ── */}
      <section className="max-w-6xl mx-auto px-6 lg:px-12 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-12 gap-16"
        >
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-gray-400 lg:sticky lg:top-8">
              Quiénes Somos
            </p>
          </motion.div>

          <div className="lg:col-span-9">
            <motion.p variants={fadeUp} custom={1} className="text-2xl md:text-3xl font-light text-gray-700 leading-relaxed mb-10">
              <span className="font-medium text-gray-900">Modas y Estilos GUOR S.A.C</span> es una empresa textil con más de una década de trayectoria en el mercado peruano, especializada en confección y venta mayorista.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="space-y-5 text-gray-500 leading-relaxed text-base border-t border-gray-100 pt-8">
              <p>
                Ofrecemos productos de alta calidad con diseños modernos y tendencias actuales. Nuestro compromiso es brindar prendas elegantes, accesibles y sostenibles para todas nuestras clientas.
              </p>
              <p>
                Nuestros procesos funcionan con máxima eficiencia, utilizando herramientas tecnológicas especializadas para gestionar inventario, pedidos y relaciones estratégicas con clientes mayoristas.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-8 border-t border-gray-100"
            >
              {[
                { num: '10+', label: 'Años de experiencia' },
                { num: '500+', label: 'Clientes mayoristas' },
                { num: '1000+', label: 'Modelos por temporada' },
                { num: '100%', label: 'Calidad garantizada' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-3xl font-semibold text-gray-900 mb-1">{stat.num}</p>
                  <p className="text-[11px] uppercase tracking-widest text-gray-400 leading-tight">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── MISIÓN / VISIÓN ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {[
              {
                tag: 'Misión',
                text: 'Ser la empresa textil líder en confección y venta mayorista de prendas para mujeres, proporcionando productos de excelente calidad, diseños innovadores y atención personalizada.',
              },
              {
                tag: 'Visión',
                text: 'Ser reconocidos como empresa de clase mundial en la industria textil peruana, destacando por nuestra calidad, innovación sostenible y compromiso con el bienestar de nuestros stakeholders.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="bg-white border border-gray-200 rounded-2xl p-10"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-gray-400 mb-6">
                  {item.tag}
                </p>
                <p className="text-gray-600 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── VALORES ── */}
      <section className="max-w-6xl mx-auto px-6 lg:px-12 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <motion.div variants={fadeUp} className="lg:col-span-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-gray-400 lg:sticky lg:top-8">
                Nuestros Valores
              </p>
            </motion.div>

            <div className="lg:col-span-9 divide-y divide-gray-100">
              {valores.map((v, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="grid grid-cols-12 gap-4 py-7 group"
                >
                  <span className="col-span-2 md:col-span-1 text-[10px] text-gray-300 font-medium pt-0.5">{v.num}</span>
                  <div className="col-span-10 md:col-span-4">
                    <h4 className="font-semibold text-gray-800 group-hover:text-[#f02d65] transition-colors duration-200 text-sm">
                      {v.titulo}
                    </h4>
                  </div>
                  <p className="col-span-12 md:col-span-7 md:col-start-auto col-start-2 text-gray-400 text-sm leading-relaxed">
                    {v.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── CONTACTO ── */}
      <section className="bg-gray-50 border-t border-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-14">
              <motion.div variants={fadeUp} className="lg:col-span-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-gray-400">
                  Contacto
                </p>
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="lg:col-span-9 text-3xl md:text-4xl font-light text-gray-900">
                ¿Tienes alguna <span className="font-semibold">pregunta</span>?
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* Info */}
              <motion.div variants={fadeUp} custom={1} className="lg:col-span-4 space-y-8">
                <p className="text-sm text-gray-500 leading-relaxed">
                  Estamos disponibles para resolver tus consultas sobre pedidos mayoristas, productos y oportunidades comerciales.
                </p>
                {[
                  { icon: <Mail size={14} />, label: 'Email', lines: ['contacto@guor.com', 'ventas@guor.com'] },
                  { icon: <Phone size={14} />, label: 'WhatsApp Business', lines: ['Contacto mayorista directo'] },
                  { icon: <MapPin size={14} />, label: 'Ubicación', lines: ['Lima, Perú'] },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
                      {item.lines.map((line, j) => (
                        <p key={j} className="text-sm text-gray-600">{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Formulario */}
              <motion.div variants={fadeUp} custom={2} className="lg:col-span-8">
                <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10">
                  {respuesta && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start gap-3 p-4 rounded-xl mb-6 text-sm ${
                        respuesta.tipo === 'exito'
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}
                    >
                      {respuesta.tipo === 'exito'
                        ? <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
                        : <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />}
                      <span>{respuesta.mensaje}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {[
                        { label: 'Nombre Completo', name: 'nombre', type: 'text', placeholder: 'Tu nombre' },
                        { label: 'Email', name: 'email', type: 'email', placeholder: 'tu@email.com' },
                      ].map((field) => (
                        <div key={field.name}>
                          <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                            {field.label}
                          </label>
                          <input
                            type={field.type}
                            name={field.name}
                            value={formData[field.name as keyof typeof formData]}
                            onChange={handleChange}
                            required
                            placeholder={field.placeholder}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                        Asunto
                      </label>
                      <select
                        name="asunto"
                        value={formData.asunto}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-gray-400 focus:bg-white transition-all appearance-none"
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
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                        Mensaje
                      </label>
                      <textarea
                        name="mensaje"
                        value={formData.mensaje}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Cuéntanos cómo podemos ayudarte..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 focus:bg-white transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={enviando}
                      className="group flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-[#f02d65] text-white text-[11px] font-semibold uppercase tracking-[0.25em] rounded-xl transition-all duration-300 disabled:opacity-50"
                    >
                      <Send size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      {enviando ? 'Enviando...' : 'Enviar Mensaje'}
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
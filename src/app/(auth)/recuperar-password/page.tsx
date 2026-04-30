"use client";

import { useState } from 'react';
import { Mail, ArrowLeft, Loader2, SendHorizontal, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RecoverPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full mx-auto p-6"
    >
      <div className="bg-[#fff4e2] backdrop-blur-3xl p-10 rounded-[2.5rem] shadow-xl border border-[#e4c28a]">
        
        {!sent ? (
          <>
            <div className="mb-8">
              <Link 
                href="/login-cliente" 
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-[#231e1d]/50 hover:text-[#b5854b] transition-colors mb-6"
              >
                <ArrowLeft size={14} /> Volver
              </Link>

              <h1 className="text-3xl font-black text-[#231e1d] tracking-tighter italic">
                Recuperar Acceso
              </h1>

              <p className="text-[#231e1d]/60 text-xs font-medium mt-2 leading-relaxed">
                Ingresa tu correo corporativo o de socio y te enviaremos un enlace seguro para restablecer tu contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#231e1d]/30 group-focus-within:text-[#b5854b]" size={18} />
                
                <input 
                  type="email" 
                  placeholder="tu-correo@empresa.com" 
                  className="w-full pl-12 pr-4 py-4 bg-[#fbddd3] border border-[#e4c28a] rounded-2xl text-sm outline-none focus:border-[#b5854b] focus:ring-2 focus:ring-[#b5854b]/20 transition-all font-bold text-[#231e1d]"
                  required 
                />
              </div>

              <button 
                disabled={loading} 
                className="w-full py-5 bg-[#231e1d] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#b5854b] transition-all"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    Enviar Enlace 
                    <SendHorizontal size={16} className="text-[#e4c28a]" />
                  </>
                )}
              </button>

            </form>
          </>
        ) : (
          <div className="text-center py-4 animate-in zoom-in duration-300">
            
            <div className="w-20 h-20 bg-[#fbddd3] text-[#b5854b] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>

            <h2 className="text-2xl font-black text-[#231e1d] mb-2">
              ¡Correo Enviado!
            </h2>

            <p className="text-[#231e1d]/60 text-sm font-medium mb-8">
              Revisa tu bandeja de entrada. Si no lo encuentras, revisa spam.
            </p>

            <Link 
              href="/login-cliente" 
              className="block w-full py-4 bg-[#231e1d] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#b5854b] transition"
            >
              Regresar al Login
            </Link>

          </div>
        )}

      </div>
    </motion.div>
  );
}
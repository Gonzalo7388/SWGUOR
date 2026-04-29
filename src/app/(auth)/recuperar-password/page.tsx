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
    // Aquí iría tu: await supabase.auth.resetPasswordForEmail(email)
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
      <div className="bg-white/70 backdrop-blur-3xl p-10 rounded-[2.5rem] shadow-2xl border border-white">
        {!sent ? (
          <>
            <div className="mb-8">
              <Link href="/login-cliente" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-stone-400 hover:text-[#D4AF37] transition-colors mb-6">
                <ArrowLeft size={14} /> Volver
              </Link>
              <h1 className="text-3xl font-black text-stone-900 tracking-tighter italic">Recuperar Acceso</h1>
              <p className="text-stone-400 text-xs font-medium mt-2 leading-relaxed">
                Ingresa tu correo corporativo o de socio y te enviaremos un enlace seguro para restablecer tu contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-[#D4AF37]" size={18} />
                <input 
                  type="email" 
                  placeholder="tu-correo@empresa.com" 
                  className="w-full pl-12 pr-4 py-4 bg-white border border-stone-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-bold"
                  required 
                />
              </div>

              <button disabled={loading} className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Enviar Enlace <SendHorizontal size={16} className="text-[#D4AF37]" /></>}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black text-stone-900 mb-2">¡Correo Enviado!</h2>
            <p className="text-stone-500 text-sm font-medium mb-8">
              Revisa tu bandeja de entrada. Si no lo encuentras, no olvides revisar la carpeta de spam.
            </p>
            <Link href="/login-cliente" className="block w-full py-4 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">
              Regresar al Login
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
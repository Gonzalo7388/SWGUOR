'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, Mail, Lock, User, 
  ArrowRight, Loader2, CheckCircle2, AlertCircle,
  Phone, MapPin
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
          data: {
            full_name: formData.get('razonSocial'),
            ruc: formData.get('ruc'),
            phone: formData.get('telefono'),
            address: formData.get('direccion'),
            user_role: 'cliente'
          }
        }
      });

      if (authError) throw authError;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl border border-stone-100 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-100">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">¡Solicitud Enviada!</h2>
          <p className="text-stone-500 text-sm leading-relaxed">
            Hemos recibido tus datos comerciales. Por favor, **revisa tu correo** para confirmar tu cuenta y esperar la validación de nuestro equipo.
          </p>
          <Link href="/auth/login" className="block w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold text-sm hover:bg-stone-800 transition-all shadow-lg">
            Volver al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center p-4 md:p-10">
      <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl shadow-stone-200/50 overflow-hidden border border-stone-100 p-8 md:p-14">
        
        {/* Encabezado Centrado */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-md border border-stone-100">
            <Image src="/logo.png" alt="Logo Guor" width={48} height={48} className="rounded-lg" />
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight mb-2">Registro de Socio Comercial</h1>
          <p className="text-stone-500 text-sm max-w-sm">
            Únete a <span className="text-[#D4AF37] font-bold">Guor Pro Textil</span> para acceder a precios mayoristas y gestión de producción.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Razón Social - Ocupa todo el ancho */}
            <div className="md:col-span-2 relative group">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
              <input name="razonSocial" required placeholder="Razón Social / Nombre de la Empresa" className="input-field" />
            </div>

            {/* RUC */}
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
              <input name="ruc" required maxLength={11} placeholder="Número de RUC" className="input-field" />
            </div>

            {/* Teléfono */}
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
              <input name="telefono" required type="tel" placeholder="Teléfono de Contacto" className="input-field" />
            </div>

            {/* Dirección - Ocupa todo el ancho */}
            <div className="md:col-span-2 relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
              <input name="direccion" required placeholder="Dirección Fiscal Completa" className="input-field" />
            </div>

            {/* Email */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
              <input name="email" type="email" required placeholder="Correo Corporativo" className="input-field" />
            </div>

            {/* Contraseña */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
              <input name="password" type="password" required placeholder="Contraseña de Acceso" className="input-field" />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl shadow-stone-200 flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>Solicitar Acceso B2B <ArrowRight size={18} className="text-[#D4AF37]" /></>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[11px] text-stone-400 font-bold tracking-wider uppercase">
            ¿YA TIENES UNA CUENTA ACTIVA?{' '}
            <Link href="/auth/login" className="text-[#B8860B] hover:text-[#D4AF37] transition-colors underline-offset-4 underline">
              INICIAR SESIÓN
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 1rem 1rem 1rem 3.5rem;
          background-color: #f9f8f6;
          border: 1px solid #e7e5e4;
          border-radius: 1.25rem;
          font-size: 0.875rem;
          font-weight: 500;
          outline: none;
          transition: all 0.2s ease;
        }
        .input-field:focus {
          border-color: #D4AF37;
          background-color: white;
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.05);
        }
      `}</style>
    </div>
  );
}
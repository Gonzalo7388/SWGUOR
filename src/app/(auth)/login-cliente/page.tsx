"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, Sparkles, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginClientePage() {
  const router = useRouter();

  // 1. ESTADOS PARA GESTIONAR DATOS Y ERRORES
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. FUNCIÓN DE CONEXIÓN CON SWGUOR API
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // ✅ VALIDACIÓN: BLOQUEO DE DOMINIO CORPORATIVO EN PORTAL SOCIOS
      if (email.toLowerCase().endsWith('@guor.com')) {
        throw new Error('Las cuentas corporativas deben ingresar por el Portal Administrativo.');
      }
      // -------------------------------------------------------------

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Credenciales de socio inválidas');

      const role = data.role?.toLowerCase().trim();

      // 3. REDIRECCIÓN SEGÚN ROL
      if (role === 'cliente') {
        router.push('/portal/dashboard');
      } else if (['gerente', 'administrador', 'recepcionista', 'disenador', 'cortador', 'ayudante', 'representante_taller'].includes(role)) {
        router.push('/admin/Panel-Administrativo/dashboard');
      } else {
        throw new Error('Rol no reconocido por el sistema de seguridad.');
      }

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 bg-white/30 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/40">
      
      {/* Lado de Invitación / Promo (Dorado GUOR) */}
      <div className="bg-[#D4AF37]/90 p-12 text-white flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Sparkles size={120} />
        </div>
        <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mb-6">
          Beneficio Exclusivo B2B
        </span>
        <h2 className="text-5xl font-serif italic leading-tight mb-4">¡Bienvenido a la <br /><span className="not-italic font-black text-6xl">Familia!</span></h2>
        <p className="text-white/80 font-medium text-sm leading-relaxed mb-8">
          Regístrate hoy como socio estratégico y obtén un <span className="text-black font-black">20% de descuento</span> en tu primera orden de producción.
        </p>
        <Link href="/registro-cliente" className="flex items-center gap-3 text-sm font-black uppercase tracking-widest bg-black text-white px-8 py-4 rounded-2xl w-fit hover:scale-105 transition-transform shadow-xl">
          <UserPlus size={18} /> Crear Cuenta
        </Link>
      </div>

      {/* LADO DEL FORMULARIO */}
      <div className="p-12 bg-white/20 backdrop-blur-lg flex flex-col justify-center">
        
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-black text-stone-900 tracking-tighter italic">Iniciar Sesión</h1>
          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Portal de Socios GUOR</p>
        </div>

        {/* ALERTA DE ERROR */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="group">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Email de Socio</label>
              <div className="relative mt-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-[#D4AF37]" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="socio@empresa.com" 
                  className="w-full pl-12 pr-4 py-4 bg-white/80 border border-stone-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-bold text-stone-900 placeholder:text-stone-300" 
                  required
                />
              </div>
            </div>
            <div className="group">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Clave de Acceso</label>
              <div className="relative mt-1">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-[#D4AF37]" size={18} />
                <input 
                  type={showPass ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-12 py-4 bg-white/80 border border-stone-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-bold text-stone-900 placeholder:text-stone-300" 
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <Link href="/recuperar-password" className="block text-[10px] font-black text-[#D4AF37] uppercase hover:underline truncate">
            ¿Olvidaste tu contraseña de socio?
          </Link>

          <button 
            disabled={loading}
            type="submit"
            className="w-full py-5 bg-[#D4AF37] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-[#b8860b] hover:shadow-[#D4AF37]/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Entrar al Portal"}
          </button>
        </form>

        {/* ✅ ENLACE PARA VOLVER A LA LANDING (Agregado) */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-stone-900 transition-colors">
            ← Volver a la página principal
          </Link>
        </div>

      </div>
    </div>
  );
}
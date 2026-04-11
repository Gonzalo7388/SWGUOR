'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Mail, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' }
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);
        
        const role = data.role.toLowerCase();

        // 1. Roles administrativos y operativos
        const rolesAdminOperativos = [
          'administrador', 
          'recepcionista', 
          'disenador', 
          'cortador', 
          'ayudante', 
          'representante_taller',
          'gerente'
        ];

        if (rolesAdminOperativos.includes(role)) {
          router.push('/admin/Panel-Administrativo/dashboard');
        } 
        // 2. Roles de clientes
        else if (role === 'cliente') {
          router.push('/portal/dashboard');
        } 
        // 3. Error si el rol no existe en ninguna lista
        else {
          throw new Error('Rol no reconocido por el sistema.');
        }
    } catch (err: any) {
        setError(err.message);
        setLoading(false);
    }
    };

  return (
    <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/50 overflow-hidden border border-stone-100">
        
        {/* Lado Decorativo - Basado en la paleta del logo */}
        <div className="hidden md:flex bg-[#1A1A1A] p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            {/* Contenedor del Logo con estilo dorado */}
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-xl border-2 border-[#D4AF37]">
              <Image 
                src="/logo.png" // Asegúrate de que el logo esté en public/logo.png
                alt="Logo Guor"
                width={64}
                height={64}
                className="rounded-lg"
              />
            </div>
            <h2 className="text-4xl font-serif italic leading-tight">
              Excelencia en <br />
              <span className="text-[#D4AF37] not-italic font-sans font-black tracking-tighter">TEXTILES B2B</span>
            </h2>
            <p className="mt-6 text-stone-400 text-sm leading-relaxed max-w-xs">
              Acceda a su panel exclusivo para gestionar órdenes de producción, 
              cotizaciones por volumen y catálogos premium.
            </p>
          </div>

          {/* Elemento decorativo que simula los marcos dorados del logo */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 border border-[#D4AF37]/20 rotate-12 flex items-center justify-center">
             <div className="w-48 h-48 border border-[#D4AF37]/30 -rotate-12"></div>
          </div>
        </div>

        {/* Lado del Formulario */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">Iniciar Sesión</h1>
            <p className="text-stone-500 text-sm mt-2 font-medium">Bienvenido de nuevo, socio comercial.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo Corporativo"
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 border-stone-200 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all font-medium text-stone-800"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 border-stone-200 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all font-medium text-stone-800"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl shadow-stone-200 flex items-center justify-center gap-3 group disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Entrar al Sistema
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-[#D4AF37]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 space-y-4">
            <p className="text-center text-[11px] text-stone-400 font-bold tracking-wider uppercase">
              ¿No tiene acceso?{' '}
              <Link href="/auth/register" className="text-[#B8860B] hover:text-[#D4AF37] transition-colors underline-offset-4 underline">
                Solicite una cuenta B2B
              </Link>
            </p>
            
            <div className="flex justify-center">
                <div className="h-[1px] w-12 bg-stone-100"></div>
            </div>
            
            <p className="text-center">
                <Link href="/" className="text-[10px] text-stone-400 hover:text-stone-600 font-medium">
                    ← Volver a la web principal
                </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginAdminPage() {
  const router = useRouter();

  // 1. ESTADOS PARA CAPTURAR DATOS Y GESTIONAR LA UI
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. FUNCIÓN DE LOGIN CONEXIÓN REAL CON TU API
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // --- VALIDACIÓN DE DOMINIO CORPORATIVO ---
      if (!email.toLowerCase().endsWith('@guor.com')) {
        throw new Error('Acceso restringido: Solo se permiten correos corporativos @guor.com');
      }
      // -----------------------------------------

      // Petición a tu API Route
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      // Log para verificar en la consola del navegador (F12)
      console.log("Respuesta del servidor SWGUOR:", data);

      if (!res.ok) {
        throw new Error(data.error || 'Credenciales incorrectas');
      }

      // Normalización del rol recibido
      const role = data.role?.toLowerCase().trim();

      // 3. LÓGICA DE REDIRECCIÓN SEGÚN TU PROJECT CHARTER 
      const staffRoles = [
        'gerente',
        'administrador',
        'recepcionista',
        'disenador',
        'cortador',
        'ayudante',
        'representante_taller'
      ];

      if (staffRoles.includes(role)) {
        // Acceso al Panel Administrativo de GUOR
        router.push('/admin/Panel-Administrativo/dashboard');
      } else if (role === 'cliente') {
        // Redirección si un cliente intenta entrar por el área de staff
        router.push('/portal/dashboard');
      } else {
        throw new Error('Su rol no cuenta con permisos para acceder a esta área.');
      }

    } catch (err: any) {
      console.error("Error detectado:", err.message);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 min-h-screen flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/50 w-full">

        {/* CABECERA DEL FORMULARIO */}
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-stone-900 text-[#D4AF37] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">GUOR Corporativo</h1>
          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mt-1">Panel Administrativo GUOR</p>
        </div>

        {/* ALERTA DE ERROR */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            {/* INPUT DE CORREO */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Usuario Corporativo"
                className="w-full pl-12 pr-4 py-4 bg-stone-50 border-stone-100 border-2 rounded-2xl text-sm outline-none focus:border-stone-900 transition-all font-bold text-stone-900"
                required
              />
            </div>

            {/* INPUT DE CONTRASEÑA */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full pl-12 pr-4 py-4 bg-stone-50 border-stone-100 border-2 rounded-2xl text-sm outline-none focus:border-stone-900 transition-all font-bold text-stone-900"
                required
              />
            </div>
          </div>

          <Link
            href="/recuperar-password"
            className="block text-right text-[10px] font-black text-stone-400 uppercase hover:text-stone-900 transition-colors truncate"
          >
            ¿Olvidaste tu clave?
          </Link>

          {/* BOTÓN DE ACCIÓN */}
          <button
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Verificando...
              </>
            ) : (
              <>
                Ingresar al Sistema <ArrowRight size={16} className="text-[#D4AF37]" />
              </>
            )}
          </button>
        </form>

        {/* LINK VOLVER A LANDING */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-stone-900 transition-colors">
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}
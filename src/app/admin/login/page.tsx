"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { ERROR_MESSAGES } from "@/lib/auth/constants";
import { ADMIN_ROUTES } from "@/lib/constants/admin";
import { RolUsuario, EstadoUsuario } from '@/types/database';

// Types
type UsuarioLogin = {
  id: number;
  rol: RolUsuario;
  estado: EstadoUsuario;
};

type LoginError = string | null;

export default function LoginPage() {
  const router = useRouter();
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LoginError>(null);

  // Prefetch dashboard para mejor UX
  useEffect(() => {
    router.prefetch(ADMIN_ROUTES.DASHBOARD);
  }, [router]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const normalizedEmail = email.trim().toLowerCase();

      // 1. Autenticación
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (authError || !user) {
        setError(authError?.status === 400 ? ERROR_MESSAGES.INVALID_CREDENTIALS : ERROR_MESSAGES.UNEXPECTED_ERROR);
        return;
      }

      // 2. Validación de usuario en DB
      const { data: usuarioData, error: dbError } = await supabase
        .from('usuarios')
        .select('id, rol, estado')
        .eq('auth_id', user.id)
        .maybeSingle<UsuarioLogin>();

      if (dbError || !usuarioData) {
        await supabase.auth.signOut();
        setError(ERROR_MESSAGES.USER_NOT_FOUND);
        return;
      }

      // 3. Validación de estado (null-safe)
      const estadoActivo = usuarioData.estado?.toLowerCase().trim() === 'activo';
      
      if (!estadoActivo) {
        await supabase.auth.signOut();
        setError(ERROR_MESSAGES.INACTIVE_USER);
        return;
      }

      // 4. Redirección exitosa
      router.replace(ADMIN_ROUTES.DASHBOARD);

    } catch (err) {
      console.error("[LoginPage] Error:", err);
      setError(ERROR_MESSAGES.UNEXPECTED_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorativo minimalista */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-100/20 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg border border-gray-100 mb-4">
            <Image 
              src="/logo.png" 
              alt="GUOR Logo" 
              width={40} 
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-light text-gray-900 mb-1">
            Modas y Estilos <span className="font-normal">GUOR</span>
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-medium">
            Gestión Administrativa
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            {/* Welcome */}
            <div className="mb-8">
              <h2 className="text-xl font-medium text-gray-900 mb-1">Bienvenido</h2>
              <p className="text-sm text-gray-500">Ingresa tus credenciales para continuar</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email corporativo
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@guor.com"
                  disabled={isLoading}
                  required
                  aria-invalid={!!error}
                  className="w-full h-12 px-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    required
                    aria-invalid={!!error}
                    className="w-full h-12 px-4 pr-12 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 disabled:bg-gray-50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div 
                  role="alert"
                  className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-lg animate-in fade-in duration-200"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading || !email || !password}
                className="w-full h-12 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Validando...</span>
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-center text-gray-500">
              ¿Problemas de acceso?{" "}
              <a 
                href="mailto:soporte@guor.com" 
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                soporte@guor.com
              </a>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-gray-400 mt-8">
          © {new Date().getFullYear()} Sistema GUOR. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useEcommerce } from '@/app/ecommerce/_contexts/AuthContext';

type AuthMode = 'login' | 'register';

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, signInWithEmail, registerWithEmail, signInWithGoogle } = useEcommerce();

  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading && user) {
      router.replace('/ecommerce/perfil');
    }
  }, [loading, user, router]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();

    if (!email || !password) {
      setError('Completa correo y contrasena para continuar.');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error: loginError } = await signInWithEmail(email, password);

        if (loginError) {
          setError(loginError);
          return;
        }

        router.push('/ecommerce/perfil');
        return;
      }

      const { error: signUpError } = await registerWithEmail(email, password);

      if (signUpError) {
        setError(signUpError);
        return;
      }

      setSuccess('Cuenta creada y sesion iniciada correctamente.');
      setPassword('');
      setConfirmPassword('');
      router.push('/ecommerce/perfil');
    } catch {
      setError('Ocurrio un error al procesar la solicitud.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearMessages();
    const safeEmail = email.trim().toLowerCase();

    if (!safeEmail) {
      setError('Ingresa tu correo Gmail en el campo de correo para continuar con Google.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: googleError } = await signInWithGoogle(safeEmail);
      if (googleError) {
        setError(googleError);
        return;
      }

      router.push('/ecommerce/perfil');
    } catch {
      setError('No fue posible iniciar con Google en este momento.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-[#FCF7F7] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-[#E7D7D7] rounded-2xl p-6 md:p-7 shadow-[0_8px_24px_rgba(74,55,55,0.06)]">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A7676] mb-3 text-center">Mi Cuenta</p>
        <h1 className="text-2xl md:text-3xl font-serif text-[#4A3737] mb-5 text-center">Acceso rapido</h1>

        <div className="flex rounded-full bg-[#F5EBEB] p-1 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              clearMessages();
            }}
            className={`flex-1 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] font-semibold transition-colors ${
              mode === 'login' ? 'bg-white text-[#4A3737]' : 'text-[#8A7676] hover:text-[#4A3737]'
            }`}
          >
            Ingresar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              clearMessages();
            }}
            className={`flex-1 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] font-semibold transition-colors ${
              mode === 'register' ? 'bg-white text-[#4A3737]' : 'text-[#8A7676] hover:text-[#4A3737]'
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <form className="space-y-3" onSubmit={handleEmailSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@gmail.com"
            className="w-full border border-[#E7D7D7] rounded-xl px-4 py-3 text-sm text-[#4A3737] placeholder:text-[#AA9A9A] focus:outline-none focus:border-[#D4AF37]"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contrasena"
            className="w-full border border-[#E7D7D7] rounded-xl px-4 py-3 text-sm text-[#4A3737] placeholder:text-[#AA9A9A] focus:outline-none focus:border-[#D4AF37]"
          />

          {mode === 'register' && (
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contrasena"
              className="w-full border border-[#E7D7D7] rounded-xl px-4 py-3 text-sm text-[#4A3737] placeholder:text-[#AA9A9A] focus:outline-none focus:border-[#D4AF37]"
            />
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-[#D4AF37] hover:bg-[#B8962D] text-white py-3 text-xs uppercase tracking-[0.2em] font-semibold disabled:opacity-70"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Procesando
              </span>
            ) : mode === 'login' ? (
              'Ingresar con correo'
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E7D7D7]" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A7676]">o</span>
          <div className="h-px flex-1 bg-[#E7D7D7]" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full rounded-full border border-[#E7D7D7] hover:border-[#D4AF37] text-[#4A3737] py-3 text-xs uppercase tracking-[0.2em] font-semibold disabled:opacity-70"
        >
          Continuar con Google
        </button>
      </div>
    </div>
  );
}
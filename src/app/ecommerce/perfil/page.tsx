'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CheckCircle2, LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';
import { useEcommerce } from '@/app/ecommerce/_contexts/AuthContext';

export default function PerfilPage() {
  const router = useRouter();
  const { user, loading, signOut } = useEcommerce();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/ecommerce');
    }
  }, [loading, user, router]);

  if (loading) {
    return <div className="min-h-[60vh] bg-[#FCF7F7]" />;
  }

  if (!user) {
    return null;
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Cliente GUOR';

  const authProvider = user.app_metadata?.provider || 'google';
  const providerLabel = authProvider === 'google' ? 'Google' : 'Correo y contrasena';

  const handleLogout = async () => {
    await signOut();
    router.push('/ecommerce');
  };

  return (
    <div className="min-h-screen bg-[#FCF7F7] py-10 md:py-14">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 md:mb-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A7676] mb-3">Mi Perfil</p>
          <h1 className="text-3xl md:text-5xl font-serif text-[#4A3737] leading-tight">
            Bienvenida, <span className="text-[#B8962D] italic">{displayName}</span>
          </h1>
          <p className="text-sm md:text-base text-[#6D5A5A] mt-4">
            Este panel muestra los datos reales de tu usuario autenticado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <article className="bg-white border border-[#E7D7D7] rounded-2xl p-6 shadow-[0_8px_24px_rgba(74,55,55,0.06)]">
            <div className="flex items-center gap-3 mb-4">
              <UserCircle2 className="w-6 h-6 text-[#D4AF37]" />
              <h2 className="font-serif text-xl text-[#4A3737]">Datos de tu cuenta</h2>
            </div>
            <div className="space-y-3 text-sm text-[#6D5A5A]">
              <p><span className="font-semibold text-[#4A3737]">Nombre:</span> {displayName}</p>
              <p><span className="font-semibold text-[#4A3737]">Correo:</span> {user.email}</p>
              <p><span className="font-semibold text-[#4A3737]">Proveedor:</span> {authProvider}</p>
              <p><span className="font-semibold text-[#4A3737]">ID Usuario:</span> {user.id}</p>
            </div>
          </article>

          <article className="bg-white border border-[#E7D7D7] rounded-2xl p-6 shadow-[0_8px_24px_rgba(74,55,55,0.06)]">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
              <h2 className="font-serif text-xl text-[#4A3737]">Estado de sesion</h2>
            </div>
            <ul className="space-y-2 text-sm text-[#6D5A5A]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B8962D] mt-0.5" />
                Sesion activa con autenticacion: {providerLabel}.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B8962D] mt-0.5" />
                Tu correo es usado para identificar tu cuenta.
              </li>
            </ul>

            <div className="mt-6 flex gap-3 flex-wrap">
              <Link
                href="/ecommerce/seguimiento-pedido"
                className="rounded-full border border-[#D4AF37]/40 px-5 py-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#4A3737] hover:border-[#D4AF37]"
              >
                Seguimiento
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full bg-[#F5EBEB] px-5 py-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#4A3737] hover:bg-[#EAD7D7]"
              >
                <LogOut size={14} /> Cerrar sesion
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

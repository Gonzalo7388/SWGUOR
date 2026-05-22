import Link from 'next/link';
import { obtenerProductosParaCotizar } from './actions';
import { SolicitarCotizacionClient } from './SolicitarCotizacionClient';

export default async function SolicitarCotizacionPage() {
  const result = await obtenerProductosParaCotizar();

  if (!result.success) {
    const mensajes: Record<string, string> = {
      unauthenticated: 'Inicia sesión para solicitar una cotización.',
      usuario_no_encontrado: 'Tu usuario no está registrado en el sistema.',
      usuario_inactivo: 'Tu cuenta está inactiva.',
      sin_permisos: 'No tienes permisos para acceder al portal.',
      cliente_no_encontrado:
        'No encontramos un perfil de cliente vinculado a tu cuenta.',
    };

    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <h1 className="text-xl font-black text-slate-900">
          No se puede cargar la solicitud
        </h1>
        <p className="text-sm text-slate-500">
          {mensajes[result.error] ?? result.error}
        </p>
        <Link
          href="/portal/cotizaciones"
          className="inline-block text-sm font-bold text-[#b5854b] hover:underline"
        >
          Volver a cotizaciones
        </Link>
      </div>
    );
  }

  return (
    <SolicitarCotizacionClient
      productos={result.productos}
      categorias={result.categorias}
    />
  );
}

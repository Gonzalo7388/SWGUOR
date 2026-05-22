import { redirect } from 'next/navigation';

/** Flujo legacy: las nuevas solicitudes van a la página dedicada. */
export default function NuevaCotizacionRedirect() {
  redirect('/portal/cotizaciones/solicitar');
}

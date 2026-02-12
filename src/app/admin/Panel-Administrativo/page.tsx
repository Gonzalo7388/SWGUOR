import { redirect } from 'next/navigation';

export default function PanelAdministrativo() {
  // Redirigir automáticamente al dashboard
  redirect('/Panel-Administrativo/dashboard');
}
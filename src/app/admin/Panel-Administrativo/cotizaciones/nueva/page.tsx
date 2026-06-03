import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CotizacionForm } from '@/components/admin/cotizaciones/CotizacionForm';
import { CotizacionesService } from '@/lib/services/cotizaciones.service';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NuevaCotizacionAdminPage({ searchParams }: Props) {
  // 1. Resolvemos y capturamos el parámetro 'from' de la URL (si existe)
  const resolvedParams = await searchParams;
  const fromId = resolvedParams.from ? String(resolvedParams.from) : undefined;

  // 2. Ejecutamos las consultas base en paralelo para optimizar la carga
  const [clientes, productos] = await Promise.all([
    CotizacionesService.listarClientes(),
    CotizacionesService.listarProductos(),
  ]);

  // 3. Si viene un ID en 'from', obtenemos la cotización origen para clonar sus datos
  let cotizacionOrigen = null;
  if (fromId) {
    try {
      // Intentamos obtener el detalle completo (incluyendo sus productos adjuntos)
      // Nota: Si tu método en el servicio se llama diferente (ej. obtenerDetalle), cámbialo aquí
      cotizacionOrigen = await CotizacionesService.obtenerPorId(String(fromId));
    } catch (error) {
      console.error("Error al cargar la cotización origen para recotizar:", error);
    }
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link
          href="/admin/Panel-Administrativo/cotizaciones"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft size={16} />
          Volver a cotizaciones
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {fromId ? 'Recotizar Propuesta' : 'Nueva cotización'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {fromId 
              ? `Clonando base de productos de la cotización original para generar una nueva versión.`
              : 'Registro manual para revisión y aprobación. También pueden llegar solicitudes automáticas desde el portal del cliente.'
            }
          </p>
        </div>

        {/* 4. Le inyectamos la prop 'cotizacionOrigen' al formulario */}
        <CotizacionForm 
          clientes={clientes} 
          productos={productos} 
          cotizacionOrigen={cotizacionOrigen} 
        />
      </div>
    </div>
  );
}
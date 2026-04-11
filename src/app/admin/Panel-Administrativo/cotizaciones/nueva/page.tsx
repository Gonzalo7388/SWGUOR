import { getClientesList, getProductosList } from '../actions';
import { CotizacionForm } from '@/components/admin/cotizaciones/CotizacionForm';

export default async function NuevaCotizacionPage() {
  const [clientes, productos] = await Promise.all([
    getClientesList(),
    getProductosList(),
  ]);

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
          Nueva Cotización
        </h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
          Complete los datos comerciales y agregue productos
        </p>
      </div>

      {/* Form */}
      <CotizacionForm
        clientes={clientes}
        productos={productos}
      />
    </div>
  );
}

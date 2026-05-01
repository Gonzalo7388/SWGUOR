import { FichaTecnicaForm } from '@/components/admin/fichas-tecnicas/FichaTecnicaForm';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Nueva Ficha Técnica | GUOR',
};

async function getProductos() {
  try {
    return await prisma.productos.findMany({
      select: { id: true, nombre: true, sku: true },
      orderBy: { nombre: 'asc' },
      take: 1000,
    });
  } catch {
    return [];
  }
}

export default async function NuevaFichaTecnicaPage() {
  const productos = await getProductos();

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
          Nueva Ficha Técnica
        </h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
          Crea una ficha técnica con medidas y especificaciones. Puedes cargar un PDF para extraer automáticamente los datos.
        </p>
      </div>

      <FichaTecnicaForm productos={productos} />
    </div>
  );
}

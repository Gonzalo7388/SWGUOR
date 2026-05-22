'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function PagoPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params.id;
  const metodo = searchParams.get('metodo');

  const total = "100.00"; // temporal (conectar a la bd)

  const METODOS_PAGO = [
    { id: 'yape', nombre: 'Yape', imagen: '/images/yape.png' },
    { id: 'tarjeta', nombre: 'Tarjeta', imagen: '/images/visa.png' },
    { id: 'transferencia', nombre: 'Transferencia', imagen: '/images/transferencia.png' },
  ];

  const metodoSeleccionado = METODOS_PAGO.find(m => m.id === metodo);
    if (!metodoSeleccionado) {
        return <div>No hay método seleccionado</div>;
      }
  return (
    <div style={{ padding: '40px' }}>
      {metodoSeleccionado && (
        <>
          {/* HEADER */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-[#b5854b] uppercase">
                Confirmar pago
              </p>
              <h2 className="text-xl font-black">Resumen</h2>
            </div>

            <button
              onClick={() => window.history.back()}
              className="w-9 h-9 rounded-xl bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 p-6">

            {/* IZQUIERDA */}
            <div className="space-y-4">

              <div className="text-center py-6 bg-[#fff4e2] rounded-2xl border">
                <p className="text-xs font-bold">Monto a pagar</p>
                <p className="text-4xl font-black">
                  PEN {total}
                </p>
                <p className="text-xs">
                  Pedido #{id}
                </p>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
                <Image
                  src={metodoSeleccionado.imagen}
                  alt=""
                  width={28}
                  height={28}
                />

                <div>
                  <p className="text-xs text-slate-400">Método</p>
                  <p className="font-bold">{metodoSeleccionado.nombre}</p>
                </div>

                <button
                  onClick={() => window.history.back()}
                  className="ml-auto text-xs text-[#b5854b]"
                >
                  Cambiar
                </button>
              </div>
            </div>

            {/* DERECHA */}
            {metodo === 'tarjeta' && (
              <div className="border p-5 rounded-2xl space-y-3">
                <input placeholder="Número de tarjeta" className="w-full p-2 border rounded" />
                <input placeholder="Nombre" className="w-full p-2 border rounded" />
                <input placeholder="MM/AA" className="w-full p-2 border rounded" />
                <input placeholder="CVV" className="w-full p-2 border rounded" />
              </div>
            )}

          </div>

          <div className="p-6 flex gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex-1 py-3 bg-gray-200 rounded"
            >
              Volver
            </button>

            <button
              onClick={() => alert('Pago confirmado')}
              className="flex-1 py-3 bg-black text-white rounded"
            >
              Confirmar pago
            </button>
          </div>
        </>
      )}
    </div>
  );
}
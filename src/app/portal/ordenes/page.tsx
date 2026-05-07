'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { EstadoBadge } from '@/components/portal/EstadoBadge';

const ORDENES = [
  {
    id: 'ORD-5502',
    fecha: '2024-10-20',
    total: 15400.0,
    estado: 'en_produccion',
    pago: 'Pendiente',
  },
  {
    id: 'ORD-5488',
    fecha: '2024-10-05',
    total: 8200.0,
    estado: 'completada',
    pago: 'Pagado',
  },
];

const METODOS_PAGO = [
  {
    nombre: 'Yape',
    imagen: '/images/yape.png',
  },
  {
    nombre: 'Tarjeta de Débito',
    imagen: '/images/visa.png',
  },
  {
    nombre: 'Transferencia Bancaria',
    imagen: '/images/transferencia.png',
  },
];

export default function MisOrdenesPage() {
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<any>(null);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState<string | null>(null);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
          <ShoppingBag size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Mis Órdenes
          </h1>

          <p className="text-sm text-slate-500">
            Historial de compras y estado de producción.
          </p>
        </div>
      </div>

      {/* LISTA */}
      <div className="space-y-4">

        {ORDENES.map((orden) => (

          <div
            key={orden.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
          >

            <div className="flex items-center gap-6">

              <div className="text-center px-4 py-2 border-r border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Orden
                </p>

                <p className="font-black text-slate-900">
                  {orden.id}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Monto Total
                </p>

                <p className="text-lg font-black text-slate-900">
                  S/ {orden.total.toLocaleString()}
                </p>
              </div>

            </div>

            <div className="flex items-center gap-8">

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Producción
                </p>

                <EstadoBadge
                  estado={orden.estado}
                  tipo="orden"
                />
              </div>

              <button
                onClick={() => setOrdenSeleccionada(orden)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold"
              >
                Ver Detalles
              </button>

              <button
                onClick={() => {
                  setOrdenSeleccionada(orden);
                  setMostrarPago(true);
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Pagar
              </button>

            </div>

          </div>

        ))}

      </div>

      {/* MODAL DETALLES */}
      {ordenSeleccionada && !mostrarPago && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl">

            <h2 className="text-xl font-black mb-4">
              Detalle de {ordenSeleccionada.id}
            </h2>

            <div className="space-y-2 text-sm text-slate-700">

              <p>
                <strong>Fecha:</strong> {ordenSeleccionada.fecha}
              </p>

              <p>
                <strong>Total:</strong> S/ {ordenSeleccionada.total}
              </p>

              <p>
                <strong>Estado:</strong> {ordenSeleccionada.estado}
              </p>

              <p>
                <strong>Pago:</strong> {ordenSeleccionada.pago}
              </p>

            </div>

            <button
              onClick={() => setOrdenSeleccionada(null)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-bold"
            >
              Cerrar
            </button>

          </div>

        </div>

      )}

      {/* MODAL PAGO */}
      {mostrarPago && ordenSeleccionada && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl space-y-4">

            <h2 className="text-xl font-black">
              Pagar {ordenSeleccionada.id}
            </h2>

            <p className="text-sm text-slate-500">
              Selecciona un método de pago
            </p>

            {/* OPCIONES */}
            <div className="space-y-3">

              {METODOS_PAGO.map((metodo) => (

                <button
                  key={metodo.nombre}
                  onClick={() => setMetodoPago(metodo.nombre)}
                  className={`w-full p-3 border rounded-xl text-left font-bold transition flex items-center gap-4
                  
                  ${
                    metodoPago === metodo.nombre
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >

                  <Image
                    src={metodo.imagen}
                    alt={metodo.nombre}
                    width={42}
                    height={42}
                    className="rounded-lg object-contain"
                  />

                  <span className="text-sm">
                    {metodo.nombre}
                  </span>

                </button>

              ))}

            </div>

            {/* BOTONES */}
            <div className="flex gap-3 pt-4">

              <button
                onClick={() => {
                  setMostrarPago(false);
                  setMetodoPago(null);
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 py-2 rounded-xl font-bold"
              >
                Cancelar
              </button>

              <button
                disabled={!metodoPago}
                onClick={() => {
                  alert(`Pagando con ${metodoPago}`);
                  setMostrarPago(false);
                  setMetodoPago(null);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-bold disabled:opacity-50"
              >
                Confirmar Pago
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
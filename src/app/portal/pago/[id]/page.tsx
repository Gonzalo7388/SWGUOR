'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  Banknote,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PAISES_SUDAMERICA = ['Perú', 'Argentina', 'Bolivia'];

const METODOS_PAGO = [
  {
    id: 'yape',
    nombre: 'Yape',
    descripcion: 'Pago inmediato con código QR',
    imagen: '/images/yape.png',
  },
  {
    id: 'tarjeta',
    nombre: 'Tarjeta',
    descripcion: 'Visa, Mastercard',
    imagen: '/images/visa.png',
  },
  {
    id: 'transferencia',
    nombre: 'Transferencia',
    descripcion: 'BCP, Interbank, BBVA',
    imagen: '/images/transferencia.png',
  },
];

export default function PagoPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const id = params.id;

  const [metodo, setMetodo] = useState(
    searchParams.get('metodo') || ''
  );

  const [datosEntrega, setDatosEntrega] = useState({
    pais: 'Perú',
    departamento: '',
    distrito: '',
    direccion: '',
    referencia: '',
  });

  const [datosTarjeta, setDatosTarjeta] = useState({
    numero: '',
    nombre: '',
    vencimiento: '',
    cvv: '',
  });

  const [datosTransferencia, setDatosTransferencia] =
    useState({
      banco: '',
      numeroOperacion: '',
      titular: '',
    });

  const total = '100.00';

  const handleConfirmar = () => {
    alert('Pago realizado (simulación)');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">

        {/* IZQUIERDA */}
        <div className="col-span-2 space-y-6">

          {/* DIRECCIÓN */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="font-black text-lg mb-4">
              Dirección
            </h2>

            <select
              value={datosEntrega.pais}
              onChange={(e) =>
                setDatosEntrega({
                  ...datosEntrega,
                  pais: e.target.value,
                })
              }
              className="w-full mb-3 p-3 border rounded-xl"
            >
              {PAISES_SUDAMERICA.map((pais) => (
                <option key={pais}>{pais}</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Departamento"
                value={datosEntrega.departamento}
                onChange={(e) =>
                  setDatosEntrega({
                    ...datosEntrega,
                    departamento: e.target.value,
                  })
                }
                className="p-3 border rounded-xl"
              />

              <input
                placeholder="Distrito"
                value={datosEntrega.distrito}
                onChange={(e) =>
                  setDatosEntrega({
                    ...datosEntrega,
                    distrito: e.target.value,
                  })
                }
                className="p-3 border rounded-xl"
              />
            </div>

            <input
              placeholder="Dirección"
              value={datosEntrega.direccion}
              onChange={(e) =>
                setDatosEntrega({
                  ...datosEntrega,
                  direccion: e.target.value,
                })
              }
              className="w-full mt-3 p-3 border rounded-xl"
            />

            <input
              placeholder="Referencia"
              value={datosEntrega.referencia}
              onChange={(e) =>
                setDatosEntrega({
                  ...datosEntrega,
                  referencia: e.target.value,
                })
              }
              className="w-full mt-3 p-3 border rounded-xl"
            />
          </div>

          {/* MÉTODO */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="font-black text-lg mb-4">
              Método de pago
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {METODOS_PAGO.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMetodo(m.id)}
                  className={cn(
                    'p-4 rounded-xl border flex items-center gap-3',
                    metodo === m.id
                      ? 'border-black'
                      : 'border-gray-200'
                  )}
                >
                  <Image
                    src={m.imagen}
                    alt={m.nombre}
                    width={30}
                    height={30}
                  />
                  <div>
                    <p className="font-bold">{m.nombre}</p>
                    <p className="text-xs text-gray-400">
                      {m.descripcion}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* DATOS DE PAGO */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="font-black text-lg mb-4">
              Datos de pago
            </h2>

            {metodo === 'tarjeta' && (
              <div className="space-y-3">
                <input
                  placeholder="Número de tarjeta"
                  className="w-full p-3 border rounded-xl"
                  onChange={(e) =>
                    setDatosTarjeta({
                      ...datosTarjeta,
                      numero: e.target.value,
                    })
                  }
                />
                <input
                  placeholder="Nombre"
                  className="w-full p-3 border rounded-xl"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="MM/AA"
                    className="p-3 border rounded-xl"
                  />
                  <input
                    placeholder="CVV"
                    className="p-3 border rounded-xl"
                  />
                </div>
              </div>
            )}

            {metodo === 'transferencia' && (
              <div className="space-y-3">
                <input
                  placeholder="Banco"
                  className="w-full p-3 border rounded-xl"
                />
                <input
                  placeholder="N° operación"
                  className="w-full p-3 border rounded-xl"
                />
                <input
                  placeholder="Titular"
                  className="w-full p-3 border rounded-xl"
                />
              </div>
            )}

            {metodo === 'yape' && (
              <p className="text-sm text-gray-500">
                Se generará un QR para pagar con Yape.
              </p>
            )}
          </div>
        </div>

        {/* DERECHA */}
        <div className="bg-white p-6 rounded-2xl shadow h-fit sticky top-8">
          <h2 className="font-black text-lg mb-4">
            Mis prendas (1)
          </h2>

          <div className="flex justify-between text-sm mb-3">
            <span>Producto</span>
            <span>S/ {total}</span>
          </div>

          <hr className="my-3" />

          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>S/ {total}</span>
          </div>

          <div className="flex justify-between font-black text-lg mt-2">
            <span>Total a pagar</span>
            <span>S/ {total}</span>
          </div>

          <button
            onClick={handleConfirmar}
            className="w-full mt-6 py-3 rounded-xl bg-[#231e1d] text-[#e4c28a] font-bold"
          >
            Pagar
          </button>
        </div>

      </div>
    </div>
  );
}
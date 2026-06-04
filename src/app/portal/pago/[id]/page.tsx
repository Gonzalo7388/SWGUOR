// app/portal/[id]/pago/page.tsx
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import CheckoutImplement from '@/components/portal/CheckoutImplement';
import YapeForm from '@/components/portal/YapeForm';
import Image from 'next/image';

const PAISES_SUDAMERICA = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia',
  'Ecuador', 'Guyana', 'Paraguay', 'Perú', 'Surinam',
  'Uruguay', 'Venezuela',
];

type MetodoPago = 'tarjeta' | 'yape';

export default function PagoPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const totalBase = Number(searchParams.get('total')) || 0;
  const cantidad = Number(searchParams.get('cantidad')) || 1;
  const nombre = searchParams.get('nombre') || 'Producto';

  const [cupon, setCupon] = useState('');
  const [descuento, setDescuento] = useState(0);
  const [metodo, setMetodo] = useState<MetodoPago>('tarjeta');

  const [datosEntrega, setDatosEntrega] = useState({
    pais: 'Perú',
    departamento: '',
    distrito: '',
    direccion: '',
    referencia: '',
  });

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const totalFinal = totalBase - descuento;
  const totalCents = Math.round(totalFinal * 100); // Culqi usa céntimos

  // ✅ Fix: setter funcional evita el bug de closure
  const mostrarToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500);
  };

  const handleAplicarCupon = () => {
    if (cupon.toLowerCase() === 'fifi10') {
      setDescuento(10);
      mostrarToast('Cupón aplicado', 'success');
    } else {
      setDescuento(0);
      mostrarToast('Cupón inválido', 'error');
    }
  };

  const handlePagoExitoso = (chargeId: string) => {
    mostrarToast(`Pago exitoso · ${chargeId}`, 'success');
    // TODO: redirigir a página de confirmación
  };

  const handlePagoError = (msg: string) => {
    mostrarToast(msg, 'error');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* TOAST */}
      {toast.show && (
        <div className={cn(
          'fixed top-6 right-6 z-50 px-6 py-3 rounded-xl text-white font-bold shadow-lg transition-all',
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        )}>
          {toast.message}
        </div>
      )}

      <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">

        {/* IZQUIERDA */}
        <div className="col-span-2 space-y-6">

          {/* DIRECCIÓN */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="font-black text-lg mb-4 text-slate-500">Dirección</h2>

            <select
              value={datosEntrega.pais}
              onChange={e => setDatosEntrega(p => ({ ...p, pais: e.target.value }))}
              className="w-full mb-3 p-3 border rounded-xl text-slate-500"
            >
              {PAISES_SUDAMERICA.map(pais => (
                <option key={pais}>{pais}</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Departamento"
                value={datosEntrega.departamento}
                onChange={e => setDatosEntrega(p => ({ ...p, departamento: e.target.value }))}
                className="p-3 border rounded-xl text-slate-500"
              />
              <input
                placeholder="Distrito"
                value={datosEntrega.distrito}
                onChange={e => setDatosEntrega(p => ({ ...p, distrito: e.target.value }))}
                className="p-3 border rounded-xl text-slate-500"
              />
            </div>

            <input
              placeholder="Dirección"
              value={datosEntrega.direccion}
              onChange={e => setDatosEntrega(p => ({ ...p, direccion: e.target.value }))}
              className="w-full mt-3 p-3 border rounded-xl text-slate-500"
            />
            <input
              placeholder="Referencia"
              value={datosEntrega.referencia}
              onChange={e => setDatosEntrega(p => ({ ...p, referencia: e.target.value }))}
              className="w-full mt-3 p-3 border rounded-xl text-slate-500"
            />
          </div>

          {/* PROMOCIONES */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="font-black text-lg mb-4 text-slate-500">Promociones</h2>
            <div className="flex gap-3">
              <input
                value={cupon}
                onChange={e => setCupon(e.target.value)}
                placeholder="Ingresa tu cupón"
                className="flex-1 p-3 border rounded-xl text-slate-500"
              />
              <button
                onClick={handleAplicarCupon}
                className="px-4 rounded-xl bg-[#231e1d] text-[#e4c28a] font-bold"
              >
                Aplicar
              </button>
            </div>
          </div>

          {/* MÉTODO DE PAGO */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="font-black text-lg mb-4 text-slate-500">Método de pago</h2>

            {/* Selector de método */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setMetodo('tarjeta')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all text-sm',
                  metodo === 'tarjeta'
                    ? 'border-[#231e1d] bg-[#231e1d] text-[#e4c28a]'
                    : 'border-gray-200 text-slate-400 hover:border-gray-300'
                )}
              >
                <CreditCard size={18} />
                Tarjeta
              </button>

              <button
                onClick={() => setMetodo('yape')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all text-sm',
                  metodo === 'yape'
                    ? 'border-[#6C2DD3] bg-[#6C2DD3] text-white'
                    : 'border-gray-200 text-slate-400 hover:border-gray-300'
                )}
              >
                {/* Logo Yape inline como texto si no tienes el SVG */}
                <Image src="/images/yape.png" alt="Yape" width={24} height={24} />
              </button>
            </div>

            {/* Panel del método seleccionado */}
            <div className="border rounded-xl p-4">
              {metodo === 'tarjeta' && (
                <CheckoutImplement
                  amount={totalCents}
                  description={`${nombre} x${cantidad}`}
                  orderId={params.id}
                  onSuccess={handlePagoExitoso}
                  onError={handlePagoError}
                />
              )}

              {metodo === 'yape' && (
                <YapeForm
                  amount={totalCents}
                  orderId={params.id}
                  onSuccess={handlePagoExitoso}
                  onError={handlePagoError}
                />
              )}
            </div>
          </div>

        </div>

        {/* DERECHA — Resumen */}
        <div className="bg-white p-6 rounded-2xl shadow h-fit sticky top-8">
          <h2 className="font-black text-lg mb-4 text-slate-500">
            Mis prendas (1)
          </h2>

          <div className="flex justify-between text-sm mb-3 text-slate-500">
            <span>{nombre} x{cantidad}</span>
            <span>S/ {totalBase.toFixed(2)}</span>
          </div>

          {descuento > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Descuento</span>
              <span>-S/ {descuento.toFixed(2)}</span>
            </div>
          )}

          <hr className="my-3" />

          <div className="flex justify-between font-black text-lg mt-2 text-[#231e1d]">
            <span>Total a pagar</span>
            <span>S/ {totalFinal.toFixed(2)}</span>
          </div>

          {/* Info del método seleccionado */}
          <p className="text-xs text-center text-slate-400 mt-4">
            {metodo === 'tarjeta'
              ? ' Pago seguro con tarjeta via Culqi'
              : ' Pago con Yape via Culqi'}
          </p>
        </div>

      </div>
    </div>
  );
}
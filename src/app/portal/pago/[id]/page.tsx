'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { X } from 'lucide-react';
import { stripePromise } from '@/lib/stripe';
import { useState } from 'react';
import {
  ShoppingBag, ArrowUpRight, Calendar,
  PackageSearch, RefreshCw, ChevronRight,
  Layers, Clock, CheckCircle2, XCircle, Truck,
  Plus, CreditCard, CheckCircle, AlertCircle,
  Receipt, Banknote, Smartphone, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';


type PasosPago = 'entrega' | 'metodo'| 'datos_pago' | 'procesando'| 'confirmacion'| 'error';
 
const PASOS = [
  {
    id: 'entrega',
    numero: 1,
    label: 'Entrega',
  },
  {
    id: 'metodo',
    numero: 2,
    label: 'Método',
  },
  {
    id: 'datos_pago',
    numero: 3,
    label: 'Pago',
  },
  {
    id: 'confirmacion',
    numero: 4,
    label: 'Confirmación',
  },
];

const PAISES_SUDAMERICA = [
  'Perú',
  'Argentina',
  'Bolivia',
];

const METODOS_PAGO = [
  {
    id: 'yape',
    nombre: 'Yape',
    descripcion: 'Pago inmediato con código QR',
    imagen: '/images/yape.png',
    icon: Smartphone,
    color: '#6C3CE1',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    tag: 'Más usado',
  },
  {
    id: 'tarjeta',
    nombre: 'Tarjeta de Débito / Crédito',
    descripcion: 'Visa, Mastercard, American Express',
    imagen: '/images/visa.png',
    icon: CreditCard,
    color: '#1A56DB',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    tag: null,
  },
  {
    id: 'transferencia',
    nombre: 'Transferencia Bancaria',
    descripcion: 'BCP, Interbank, BBVA, Scotiabank',
    imagen: '/images/transferencia.png',
    icon: Banknote,
    color: '#057A55',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    tag: null,
  },
];


export default function PagoPage() {

 const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const id = params.id;

  const [paso, setPaso] =
    useState<PasosPago>('entrega');

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

  const pasoActual = PASOS.findIndex(
    (p) => p.id === paso
  );

  const metodoSeleccionado =
    METODOS_PAGO.find(
      (m) => m.id === metodo
    );

  const handleConfirmar = async () => {
    try {
      setPaso('procesando');

      setTimeout(() => {
        setPaso('confirmacion');
      }, 2000);

    } catch (error) {
      console.error(error);
      setPaso('error');
    }
  };


 return (
   <div className="min-h-screen">

    {/* STEPPER */}
      <div className="flex items-center justify-between">
    
        {PASOS.map((p, index) => {
          const activo = index <= pasoActual;
    
          return (
            <div
              key={p.id}
              className="flex items-center flex-1"
            >
    
              {/* Círculo */}
              <div className="flex flex-col items-center relative z-10">
    
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all',
                    activo
                      ? 'bg-[#231e1d] text-[#e4c28a]'
                      : 'bg-slate-100 text-slate-400'
                  )}
                >
                  {p.numero}
                </div>
    
                <span
                  className={cn(
                    'text-[10px] font-bold mt-2 uppercase tracking-wider',
                    activo
                      ? 'text-[#231e1d]'
                      : 'text-slate-400'
                  )}
                >
                  {p.label}
                </span>
    
              </div>
    
              {/* Línea */}
              {index < PASOS.length - 1 && (
                <div className="flex-1 h-[2px] mx-3 bg-slate-200 relative top-[-10px]">
                  <div
                    className={cn(
                      'h-full transition-all',
                      index < pasoActual
                        ? 'bg-[#231e1d]'
                        : 'bg-slate-200'
                    )}
                  />
                </div>
              )}
    
            </div>
          );
        })}
    
      </div>
   

     {/* ── PASO 1: ENTREGA ─────────────────────────────── */}
{paso === 'entrega' && (
  <div className="p-8 space-y-5">

    <div>
      <p className="text-xl font-black text-[#231e1d]">
        Datos de entrega
      </p>

      <p className="text-sm text-slate-400 mt-1">
        Completa la información para el envío
      </p>
    </div>

    {/* País */}
    <div>
      <label className="text-xs font-bold text-slate-500">
        País
      </label>

      <select
        value={datosEntrega.pais}
        onChange={(e) =>
          setDatosEntrega({
            ...datosEntrega,
            pais: e.target.value,
          })
        }
        className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-3 bg-white"
      >
        {PAISES_SUDAMERICA.map((pais) => (
          <option key={pais} value={pais}>
            {pais}
          </option>
        ))}
      </select>
    </div>

    {/* Departamento + Distrito */}
    <div className="grid grid-cols-2 gap-4">

      <div>
        <label className="text-xs font-bold text-slate-500">
          Departamento
        </label>

        <input
          type="text"
          value={datosEntrega.departamento}
          onChange={(e) =>
            setDatosEntrega({
              ...datosEntrega,
              departamento: e.target.value,
            })
          }
          className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-3"
          placeholder="Lima"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500">
          Distrito
        </label>

        <input
          type="text"
          value={datosEntrega.distrito}
          onChange={(e) =>
            setDatosEntrega({
              ...datosEntrega,
              distrito: e.target.value,
            })
          }
          className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-3"
          placeholder="Miraflores"
        />
      </div>

    </div>

    {/* Dirección */}
    <div>
      <label className="text-xs font-bold text-slate-500">
        Dirección
      </label>

      <input
        type="text"
        value={datosEntrega.direccion}
        onChange={(e) =>
          setDatosEntrega({
            ...datosEntrega,
            direccion: e.target.value,
          })
        }
        className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-3"
        placeholder="Av. Ejemplo 123"
      />
    </div>

    {/* Referencia */}
    <div>
      <label className="text-xs font-bold text-slate-500">
        Referencia
      </label>

      <input
        type="text"
        value={datosEntrega.referencia}
        onChange={(e) =>
          setDatosEntrega({
            ...datosEntrega,
            referencia: e.target.value,
          })
        }
        className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-3"
        placeholder="Frente al parque"
      />
    </div>

    {/* Botones */}
    <div className="flex gap-3 pt-4">

      <button
        onClick={() => window.history.back()}
        className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold transition-colors"
      >
        Cancelar
      </button>

      <button
        onClick={() => setPaso('metodo')}
        className="flex-1 py-3 rounded-2xl bg-[#231e1d] hover:bg-[#b5854b] text-[#e4c28a] text-sm font-bold transition-all"
      >
        Continuar
      </button>

    </div>

  </div>
)}

        {/* ── PASO 2: SELECCION DE METODO────────────────────────────────────── */}
       {paso === 'metodo' &&  (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                
                <h2 className="text-xl font-black text-[#231e1d]">Selecciona método</h2>
              </div>
             
            </div>

            {/* Resumen */}
            <div className="mx-6 mt-4 p-4 rounded-2xl bg-[#fff4e2] border border-[#e4c28a]/40 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-[#b5854b]/60 uppercase tracking-wider">Pedido #{id}</p>
                <p className="font-black text-[#231e1d] text-lg">PEN {total}</p>
              </div>
              <Receipt size={20} className="text-[#b5854b]/40" />
            </div>

            {/* Métodos */}
            <div className="p-6 grid grid-cols-2 gap-6 ">
              {METODOS_PAGO.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMetodo(m.id)}
                  className={cn(
                    'w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 relative',
                    metodo === m.id
                      ? 'border-[#b5854b] bg-[#fff4e2] shadow-md shadow-[#b5854b]/10'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50',
                  )}
                >
                  {/* Logo */}
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', m.bg)}>
                    <Image
                      src={m.imagen}
                      alt={m.nombre}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#231e1d] text-sm">{m.nombre}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{m.descripcion}</p>
                  </div>

                  {/* Tag */}
                  {m.tag && (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-[#b5854b] text-white px-2 py-1 rounded-full">
                      {m.tag}
                    </span>
                  )}

                  {/* Check */}
                  {metodo === m.id && (
                    <div className="w-5 h-5 rounded-full bg-[#b5854b] flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Botones */}
            <div className="px-6 pb-6 flex gap-3">
             <button
              onClick={() => setPaso('entrega')}
              className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold transition-colors"
              >
                 Volver
            </button>
              <button
                disabled={!metodo}
                onClick={() => {
                  if (!metodo) {
                    alert('Selecciona un método de pago');
                    return;
                  }
                 setPaso('datos_pago');
                  
                }}
                className="flex-1 py-3 rounded-2xl bg-[#231e1d] hover:bg-[#b5854b] text-[#e4c28a] text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CreditCard size={14} />
                Continuar
              </button>
            </div>
          </>
        )}

        {/* ── PASO 3:datos_pago ──────────────────────────────────────── */}
        
        {paso === 'datos_pago' && (
  <div className="p-6">

    {/* TARJETA */}
    {metodo === 'tarjeta' && (
      <div className="space-y-4">

        <div>
          <label className="text-xs font-bold text-slate-500">
            Número de tarjeta
          </label>

          <input
            type="text"
            value={datosTarjeta.numero}
            onChange={(e) =>
              setDatosTarjeta({
                ...datosTarjeta,
                numero: e.target.value,
              })
            }
            className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-3"
            placeholder="0000 0000 0000 0000"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500">
            Nombre del titular
          </label>

          <input
            type="text"
            value={datosTarjeta.nombre}
            onChange={(e) =>
              setDatosTarjeta({
                ...datosTarjeta,
                nombre: e.target.value,
              })
            }
            className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-3"
            placeholder="Juan Pérez"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500">
              Vencimiento
            </label>

            <input
              type="text"
              value={datosTarjeta.vencimiento}
              onChange={(e) =>
                setDatosTarjeta({
                  ...datosTarjeta,
                  vencimiento: e.target.value,
                })
              }
              className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-3"
              placeholder="MM/AA"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500">
              CVV
            </label>

            <input
              type="text"
              value={datosTarjeta.cvv}
              onChange={(e) =>
                setDatosTarjeta({
                  ...datosTarjeta,
                  cvv: e.target.value,
                })
              }
              className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-3"
              placeholder="123"
            />
          </div>
        </div>
      </div>
    )}

    {/* TRANSFERENCIA */}
    {metodo === 'transferencia' && (
      <div className="space-y-4">

        <div>
          <label className="text-xs font-bold text-slate-500">
            Banco
          </label>

          <input
            type="text"
            value={datosTransferencia.banco}
            onChange={(e) =>
              setDatosTransferencia({
                ...datosTransferencia,
                banco: e.target.value,
              })
            }
            className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-3"
            placeholder="BCP"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500">
            Número de operación
          </label>

          <input
            type="text"
            value={datosTransferencia.numeroOperacion}
            onChange={(e) =>
              setDatosTransferencia({
                ...datosTransferencia,
                numeroOperacion: e.target.value,
              })
            }
            className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-3"
            placeholder="123456789"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500">
            Titular
          </label>

          <input
            type="text"
            value={datosTransferencia.titular}
            onChange={(e) =>
              setDatosTransferencia({
                ...datosTransferencia,
                titular: e.target.value,
              })
            }
            className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-3"
            placeholder="Juan Pérez"
          />
        </div>
      </div>
    )}
        {/* BOTONES */}
        <div className="flex gap-3 mt-6">

        <button
        onClick={() => setPaso('metodo')}
        className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold transition-colors"
        >
        Volver
      </button>

      <button
        onClick={handleConfirmar}
        className="flex-1 py-3 rounded-2xl bg-[#231e1d] hover:bg-[#b5854b] text-[#e4c28a] text-sm font-bold transition-all"
      >
        Pagar ahora
      </button>

    </div>

  </div>
)}


        {/* ── PASO 4: Procesando ───────────────────────────────────────────── */}
       {paso === 'procesando' && (
          <div className="p-12 flex flex-col items-center justify-center gap-5 text-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-[#e4c28a]/20" />
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#b5854b]"
                style={{ animation: 'spin 0.8s linear infinite' }}
              />
            </div>
            <div>
              <p className="font-black text-[#231e1d] text-lg">Procesando pago</p>
              <p className="text-sm text-slate-400 mt-1">Por favor espera un momento...</p>
            </div>
          </div>
        )}
         
         
          {/* ── PASO 5: Confirmación ───────────────────────────────────────────── */}
          {paso === 'confirmacion' && (
  <div className="p-12 flex flex-col items-center justify-center gap-5 text-center">
    <div
      className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center"
      style={{ animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}
    >
      <CheckCircle size={36} className="text-emerald-500" />
    </div>

    <div>
      <p className="font-black text-[#231e1d] text-xl">
        ¡Pago registrado!
      </p>

      <p className="text-sm text-slate-400 mt-2">
        Tu pago con{' '}
        <strong className="text-[#b5854b]">
          {metodoSeleccionado?.nombre}
        </strong>{' '}
        ha sido registrado y está pendiente de verificación.
      </p>
    </div>

    <div className="w-full mt-2 p-4 rounded-2xl bg-[#fff4e2] border border-[#e4c28a]/40 text-left">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-500">Pedido</span>

        <span className="font-bold text-[#b5854b]">
          #{id}
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-slate-500">Monto</span>

        <span className="font-black text-[#231e1d]">
          PEN {total}
        </span>
      </div>
    </div>

    <button
      onClick={() => window.history.back()}
      className="w-full py-3 rounded-2xl bg-[#231e1d] hover:bg-[#b5854b] text-[#e4c28a] text-sm font-bold transition-all"
    >
      Listo
    </button>
  </div>
)}


        {/* ── PASO 6: Error ───────────────────────────────────────────── */}
        {paso === 'error' && (
          <div className="p-12 flex flex-col items-center justify-center gap-5 text-center">
            <div className="w-20 h-20 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center">
              <AlertCircle size={36} className="text-rose-500" />
            </div>
            <div>
              <p className="font-black text-[#231e1d] text-xl">Error al procesar</p>
              <p className="text-sm text-slate-400 mt-2">
                No se pudo procesar el pago. Por favor intenta nuevamente.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => window.history.back()} className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold transition-colors">
                Cancelar
              </button>
              <button onClick={() => setPaso('metodo')} className="flex-1 py-3 rounded-2xl bg-[#231e1d] hover:bg-[#b5854b] text-[#e4c28a] text-sm font-bold transition-all">
                Reintentar
              </button>
            </div>
          </div>
        )}


  </div>
);

}
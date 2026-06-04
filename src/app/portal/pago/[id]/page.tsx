'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CreditCard, MapPinHouse, ReceiptText, ShieldCheck, TicketPercent } from 'lucide-react';
import { cn } from '@/lib/utils';
import CheckoutImplement from '@/components/CheckoutImplement';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { usePeruUbigeo } from '@/lib/hooks/usePeruUbigeo';

const PAISES_SUDAMERICA = [
  'Argentina',
  'Bolivia',
  'Brasil',
  'Chile',
  'Colombia',
  'Ecuador',
  'Guyana',
  'Paraguay',
  'Perú',
  'Surinam',
  'Uruguay',
  'Venezuela',
];

type CountryLocationMap = Record<string, Record<string, string[]>>;

const LOCATION_DATA_BY_COUNTRY: CountryLocationMap = {
  Argentina: {
    'Buenos Aires': ['La Plata', 'Mar del Plata', 'Bahia Blanca'],
    Cordoba: ['Cordoba Capital', 'Villa Carlos Paz', 'Rio Cuarto'],
    Mendoza: ['Mendoza Capital', 'Godoy Cruz', 'San Rafael'],
  },
  Bolivia: {
    'La Paz': ['La Paz', 'El Alto', 'Viacha'],
    SantaCruz: ['Santa Cruz de la Sierra', 'Montero', 'Warnes'],
    Cochabamba: ['Cochabamba', 'Quillacollo', 'Sacaba'],
  },
  Brasil: {
    'Sao Paulo': ['Sao Paulo', 'Campinas', 'Santos'],
    'Rio de Janeiro': ['Rio de Janeiro', 'Niteroi', 'Petropolis'],
    MinasGerais: ['Belo Horizonte', 'Uberlandia', 'Contagem'],
  },
  Chile: {
    Metropolitana: ['Santiago', 'Maipu', 'Las Condes'],
    Valparaiso: ['Valparaiso', 'Vina del Mar', 'Quilpue'],
    Biobio: ['Concepcion', 'Talcahuano', 'Los Angeles'],
  },
  Colombia: {
    Cundinamarca: ['Bogota', 'Soacha', 'Chia'],
    Antioquia: ['Medellin', 'Envigado', 'Bello'],
    ValleDelCauca: ['Cali', 'Palmira', 'Buenaventura'],
  },
  Ecuador: {
    Pichincha: ['Quito', 'Cayambe', 'Ruminahui'],
    Guayas: ['Guayaquil', 'Duran', 'Samborondon'],
    Azuay: ['Cuenca', 'Gualaceo', 'Sigsig'],
  },
  Guyana: {
    DemeraraMahaica: ['Georgetown', 'Paradise', 'Mahaica'],
    Berbice: ['New Amsterdam', 'Rose Hall', 'Corriverton'],
  },
  Paraguay: {
    Central: ['San Lorenzo', 'Luque', 'Lambare'],
    Asuncion: ['Asuncion', 'Trinidad', 'Recoleta'],
    AltoParana: ['Ciudad del Este', 'Hernandarias', 'Minga Guazu'],
  },
  Surinam: {
    Paramaribo: ['Paramaribo', 'Rainville', 'Centrum'],
    Wanica: ['Lelydorp', 'Domburg', 'Koewarasan'],
  },
  Uruguay: {
    Montevideo: ['Montevideo', 'Pocitos', 'Carrasco'],
    Canelones: ['Las Piedras', 'Pando', 'Ciudad de la Costa'],
    Maldonado: ['Maldonado', 'Punta del Este', 'San Carlos'],
  },
  Venezuela: {
    DistritoCapital: ['Caracas', 'El Recreo', 'La Candelaria'],
    Miranda: ['Petare', 'Baruta', 'Los Teques'],
    Zulia: ['Maracaibo', 'Cabimas', 'San Francisco'],
  },
};


export default function PagoPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const totalQuery = Number(searchParams.get('total')) || 0;
  const cantidadQuery = Number(searchParams.get('cantidad')) || 0;
  const nombreQuery = searchParams.get('nombre') || '';
  const monedaQuery = searchParams.get('moneda') || 'PEN';

  const [pedidoCargado, setPedidoCargado] = useState<{
    id: number;
    total: number;
    total_unidades: number;
    moneda: string;
  } | null>(null);

  useEffect(() => {
    const pedidoId = Number(params?.id);
    if (!pedidoId || Number.isNaN(pedidoId)) return;

    const cargarPedido = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('pedidos')
          .select('id, total, total_unidades, moneda')
          .eq('id', pedidoId)
          .single();

        if (error || !data) return;

        setPedidoCargado({
          id: Number(data.id),
          total: Number(data.total ?? 0),
          total_unidades: Number(data.total_unidades ?? 0),
          moneda: String(data.moneda ?? 'PEN'),
        });
      } catch (err) {
        console.error('No se pudo cargar el pedido para pago', err);
      }
    };

    cargarPedido();
  }, [params?.id]);

  const pedidoIdLabel = Number(params?.id) || pedidoCargado?.id || 0;
  const nombre =
    nombreQuery ||
    (pedidoIdLabel > 0 ? `Pedido #${pedidoIdLabel}` : 'Pedido');
  const cantidad =
    cantidadQuery > 0
      ? cantidadQuery
      : Number(pedidoCargado?.total_unidades ?? 1) || 1;
  const moneda = pedidoCargado?.moneda || monedaQuery || 'PEN';

  const totalBase = useMemo(() => {
    if (totalQuery > 0) return totalQuery;
    return Number(pedidoCargado?.total ?? 0);
  }, [pedidoCargado?.total, totalQuery]);

  const [cupon, setCupon] = useState('');
  const [descuento, setDescuento] = useState(0);

  const totalFinal = Math.max(totalBase - descuento, 0);
  const totalEnCentimos = Math.round(totalFinal * 100);


  const [datosEntrega, setDatosEntrega] = useState({
    pais: 'Perú',
    departamento: '',
    distrito: '',
    direccion: '',
    referencia: '',
  });

  const [departamentoPeruCode, setDepartamentoPeruCode] = useState('');
  const [loadingDistritosPeru, setLoadingDistritosPeru] = useState(false);
  const [distritosPeru, setDistritosPeru] = useState<{ code: string; name: string }[]>([]);

  const { departamentos: departamentosPeru, provincias: provinciasPeru } = usePeruUbigeo(
    departamentoPeruCode,
    ''
  );

  const fmt = useMemo(
    () =>
      new Intl.NumberFormat('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const mostrarToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });

    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 2500);
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

  const handlePagoExitoso = () => {
    mostrarToast('Pago procesado correctamente', 'success');
  };

  const inputBaseClass =
    'w-full h-12 px-4 border rounded-xl text-[#425f7c] bg-white/90 transition-all outline-none focus:border-[#e4c28a] focus:ring-2 focus:ring-[#e4c28a]/20';

  const departamentosNoPeru = useMemo(() => {
    const byCountry = LOCATION_DATA_BY_COUNTRY[datosEntrega.pais] || {};
    return Object.keys(byCountry);
  }, [datosEntrega.pais]);

  const distritosNoPeru = useMemo(() => {
    if (!datosEntrega.departamento) return [];
    const byCountry = LOCATION_DATA_BY_COUNTRY[datosEntrega.pais] || {};
    return byCountry[datosEntrega.departamento] || [];
  }, [datosEntrega.departamento, datosEntrega.pais]);

  useEffect(() => {
    if (datosEntrega.pais !== 'Perú') {
      setDepartamentoPeruCode('');
      setDistritosPeru([]);
      return;
    }

    const selectedDeptCode = departamentosPeru.find(
      (d) => d.name === datosEntrega.departamento
    )?.code;

    if (selectedDeptCode) {
      setDepartamentoPeruCode(selectedDeptCode);
    }
  }, [datosEntrega.departamento, datosEntrega.pais, departamentosPeru]);

  useEffect(() => {
    if (datosEntrega.pais !== 'Perú' || !departamentoPeruCode) {
      setDistritosPeru([]);
      return;
    }

    const cargarDistritosPorDepartamento = async () => {
      try {
        setLoadingDistritosPeru(true);

        const distritosPorProvincia = await Promise.all(
          provinciasPeru.map(async (provincia) => {
            const res = await fetch(`/api/ubigeo?tipo=distritos&codigo=${provincia.code}`);
            const json = await res.json();
            return (json.data ?? []) as { code: string; name: string }[];
          })
        );

        const uniqMap = new Map<string, { code: string; name: string }>();
        distritosPorProvincia.flat().forEach((item) => {
          if (!uniqMap.has(item.name)) {
            uniqMap.set(item.name, item);
          }
        });

        const list = Array.from(uniqMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name, 'es')
        );

        setDistritosPeru(list);
      } catch (err) {
        console.error('No se pudieron cargar distritos de Peru', err);
        setDistritosPeru([]);
      } finally {
        setLoadingDistritosPeru(false);
      }
    };

    cargarDistritosPorDepartamento();
  }, [datosEntrega.pais, departamentoPeruCode, provinciasPeru]);

  const handlePaisChange = (pais: string) => {
    setDatosEntrega((prev) => ({
      ...prev,
      pais,
      departamento: '',
      distrito: '',
    }));
  };

  const handleDepartamentoChange = (departamento: string) => {
    setDatosEntrega((prev) => ({
      ...prev,
      departamento,
      distrito: '',
    }));
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] px-4 py-6 md:px-8 md:py-8">

      {/*TOAST */}
      {toast.show && (
        <div
          className={cn(
            'fixed top-6 right-6 z-50 px-6 py-3 rounded-xl text-white font-bold shadow-lg transition-all',
            toast.type === 'success'
              ? 'bg-emerald-500'
              : 'bg-rose-500'
          )}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto mb-5 rounded-2xl border border-[#e4c28a]/35 bg-gradient-to-r from-[#fff8ec] via-white to-[#fff5e7] p-4 md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#b5854b]">Pasarela segura</p>
            <h1 className="text-xl md:text-2xl font-black text-[#231e1d] mt-1">Finaliza tu pago</h1>
            <p className="text-sm text-[#425f7c] mt-1">Pedido {pedidoIdLabel > 0 ? `#${pedidoIdLabel}` : 'actual'} listo para procesar.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-[#6e8bab]">
            <ShieldCheck size={16} className="text-[#2e7d5b]" />
            Transacción protegida
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">

        {/* IZQUIERDA */}
        <div className="lg:col-span-2 space-y-6">

          {/* DIRECCIÓN */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e4c28a]/20">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-8 h-8 rounded-lg bg-[#e4c28a]/20 text-[#b5854b] flex items-center justify-center">
                <MapPinHouse size={16} />
              </span>
              <h2 className="font-black text-lg text-[#425f7c]">Dirección de entrega</h2>
            </div>

            <select
              value={datosEntrega.pais}
              onChange={(e) => handlePaisChange(e.target.value)}
              className={`${inputBaseClass} mb-3`}
            >
              {PAISES_SUDAMERICA.map((pais) => (
                <option key={pais}>{pais}</option>
              ))}
            </select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={datosEntrega.departamento}
                onChange={(e) => handleDepartamentoChange(e.target.value)}
                className={inputBaseClass}
              >
                <option value="">Selecciona departamento</option>
                {datosEntrega.pais === 'Perú'
                  ? departamentosPeru.map((dep) => (
                      <option key={dep.code} value={dep.name}>
                        {dep.name}
                      </option>
                    ))
                  : departamentosNoPeru.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
              </select>

              <select
                value={datosEntrega.distrito}
                onChange={(e) =>
                  setDatosEntrega((prev) => ({ ...prev, distrito: e.target.value }))
                }
                className={inputBaseClass}
                disabled={!datosEntrega.departamento || loadingDistritosPeru}
              >
                <option value="">
                  {loadingDistritosPeru
                    ? 'Cargando distritos...'
                    : 'Selecciona distrito'}
                </option>
                {(datosEntrega.pais === 'Perú' ? distritosPeru.map((d) => d.name) : distritosNoPeru).map(
                  (dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  )
                )}
              </select>
            </div>

            <input
              value={datosEntrega.direccion}
              onChange={(e) => setDatosEntrega(prev => ({ ...prev, direccion: e.target.value }))}
              placeholder="Dirección"
              className={`${inputBaseClass} mt-3`}
            />
            <input
              value={datosEntrega.referencia}
              onChange={(e) => setDatosEntrega(prev => ({ ...prev, referencia: e.target.value }))}
              placeholder="Referencia"
              className={`${inputBaseClass} mt-3`}
            />
          </div>

          {/* PROMOCIONES */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e4c28a]/20">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-8 h-8 rounded-lg bg-[#e4c28a]/20 text-[#b5854b] flex items-center justify-center">
                <TicketPercent size={16} />
              </span>
              <h2 className="font-black text-lg text-[#425f7c]">Promociones</h2>
            </div>

            <div className="flex gap-3">
              <input
                value={cupon}
                onChange={(e) => setCupon(e.target.value)}
                placeholder="Ingresa tu cupón"
                className={inputBaseClass}
              />

              <button
                onClick={handleAplicarCupon}
                className="h-12 px-5 rounded-xl bg-[#231e1d] text-[#e4c28a] font-bold hover:bg-[#2f2927] transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>

          {/* MÉTODO */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e4c28a]/20">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-8 h-8 rounded-lg bg-[#e4c28a]/20 text-[#b5854b] flex items-center justify-center">
                <CreditCard size={16} />
              </span>
              <h2 className="font-black text-lg text-[#425f7c]">Método de pago</h2>
            </div>

            <div className="border border-[#e4c28a]/30 bg-[#fffdfa] rounded-xl p-4">
             <CheckoutImplement
               amount={totalEnCentimos}
               pedidoId={pedidoIdLabel}
               onSuccess={handlePagoExitoso}
             />
            </div>

    
          </div>
              
        </div>

        {/* DERECHA */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e4c28a]/25 h-fit lg:sticky lg:top-8">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-8 h-8 rounded-lg bg-[#e4c28a]/20 text-[#b5854b] flex items-center justify-center">
              <ReceiptText size={16} />
            </span>
            <h2 className="font-black text-lg text-[#425f7c]">Detalle del pedido</h2>
          </div>

          <div className="rounded-xl border border-[#e4c28a]/25 bg-[#fffaf1] px-4 py-3 mb-3">
            <div className="flex justify-between text-sm text-[#425f7c]">
              <span className="font-semibold">{nombre} x{cantidad}</span>
              <span>{moneda} {fmt.format(totalBase)}</span>
            </div>
          </div>

          {descuento > 0 && (
            <div className="flex justify-between text-sm text-emerald-600 mb-2">
              <span>Descuento</span>
              <span>-{moneda} {fmt.format(descuento)}</span>
            </div>
          )}

          <hr className="my-4 border-[#e4c28a]/30" />

          <div className="flex justify-between items-end mt-1 text-[#231e1d]">
            <span className="font-black text-base">Total a pagar</span>
            <span className="font-black text-2xl tracking-tight">{moneda} {fmt.format(totalFinal)}</span>
          </div>

          <p className="text-xs mt-5 text-[#6e8bab] leading-relaxed">
            El pago se inicia desde el botón Pagar con Culqi en la sección Método de pago.
          </p>
        </div>

      </div>
    </div>
  );
}
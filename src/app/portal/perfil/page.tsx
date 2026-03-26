'use client';

import { 
  Building2, CreditCard, FileText, 
  MapPin, ShieldCheck, Download, ExternalLink 
} from 'lucide-react';
import { usePortal } from '../_contexts/PortalContext';
import { formatCurrency } from '@/lib/helpers/format-helpers';

export default function PerfilPage() {
  const { cliente } = usePortal();

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Perfil Corporativo</h1>
        <p className="text-sm text-slate-500">Gestione sus datos fiscales, líneas de crédito y condiciones comerciales.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Datos de Empresa */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
              <Building2 size={18} className="text-slate-400" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-700">Información Fiscal</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Razón Social</label>
                <p className="text-sm font-bold text-slate-900 mt-1">{cliente?.razon_social || 'Cargando...'}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RUC</label>
                <p className="text-sm font-bold text-slate-900 mt-1">{cliente?.ruc || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dirección de Facturación</label>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin size={14} className="text-slate-400 mt-0.5" />
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {cliente?.direccion || 'No especificada'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Documentos Legales */}
          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-slate-400" />
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-700">Documentos del Cliente</h2>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {['Contrato Marco B2B 2024', 'Ficha RUC Actualizada', 'Certificado de Calidad GUOR'].map((doc) => (
                <div key={doc} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-medium text-slate-700">{doc}</span>
                  <button className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700">
                    <Download size={14} /> PDF
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Columna Derecha: Estado Financiero */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
            {/* Adorno visual */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl" />
            
            <div className="flex items-center gap-2 mb-6">
              <CreditCard size={18} className="text-blue-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-200">Línea de Crédito</h3>
            </div>
            
            <div className="space-y-1 mb-6">
              <p className="text-3xl font-black">{formatCurrency(15000)}</p>
              <p className="text-[10px] text-blue-300 font-medium">Disponible para nuevas órdenes</p>
            </div>

            <div className="space-y-3">
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[65%]" />
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-slate-400">Usado: {formatCurrency(8500)}</span>
                <span className="text-white">65%</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <ShieldCheck size={18} />
              <h3 className="text-xs font-black uppercase tracking-widest">Condición de Pago</h3>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-emerald-900">Crédito 30 días</p>
              <p className="text-[11px] text-emerald-700/70 leading-snug">
                Usted cuenta con la categoría de **Cliente VIP**, permitiéndole facturar con pagos diferidos.
              </p>
            </div>
            <button className="w-full py-2 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 transition-colors">
              SOLICITAR AMPLIACIÓN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
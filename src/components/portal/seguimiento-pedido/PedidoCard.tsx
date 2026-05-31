'use client';

import type { PedidoConSeguimiento } from '@/lib/services/seguimiento-pedido.service';
import TimelineSimple from './TimelineSimple';

interface PedidoCardProps {
    pedido: PedidoConSeguimiento;
}

export default function PedidoCard({ pedido }: PedidoCardProps) {
    const fechaFormateada = new Date(pedido.created_at).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
    });

    return (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden transition-all duration-300 hover:shadow-md">
            {/* Cabecera del Pedido */}
            <div className="p-6 sm:p-8 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
                <div className="text-left">
                    <span className="text-[10px] font-bold text-[#B8962D] bg-amber-50 px-3 py-1 rounded-md uppercase tracking-wider border border-amber-200/50">
                        {pedido.codigo}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 mt-2">{pedido.cliente}</h3>
                </div>
                <div className="flex gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unidades</p>
                        <p className="text-base font-bold text-slate-800 mt-0.5">{pedido.total_unidades}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha Pedido</p>
                        <p className="text-base font-bold text-slate-800 mt-0.5 uppercase">{fechaFormateada}</p>
                    </div>
                </div>
            </div>

            {/* Flujo de Línea de Tiempo */}
            <div className="bg-slate-50/40 border-b border-slate-50">
                <TimelineSimple estadoActual={pedido.estado} />
            </div>

            {/* Footer del Pedido */}
            <div className="px-6 sm:px-8 py-3.5 bg-white flex items-center justify-between gap-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Estado: <span className="text-slate-700 font-semibold">{pedido.estado.replace('_', ' ')}</span>
                </p>
                <a
                    href={`https://wa.me/51908801912?text=Hola, quisiera consultar sobre mi pedido ${pedido.codigo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold uppercase text-[#B8962D] hover:text-amber-700 transition-colors"
                >
                    Consultar con asesor
                </a>
            </div>
        </div>
    );
}
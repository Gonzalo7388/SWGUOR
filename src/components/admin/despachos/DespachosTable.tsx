import React from 'react';

const ESTADO_STYLING = {
  preparando: "bg-yellow-50 text-yellow-700",
  enviado: "bg-blue-50 text-blue-700",
  transito: "bg-purple-50 text-purple-700",
  entregado: "bg-emerald-50 text-emerald-700",
  incidencia: "bg-red-50 text-red-700"
};

export const DespachoTable = ({ despachos, loading }: { despachos: any[], loading: boolean }) => {
  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Sincronizando...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['Despacho', 'Cliente', 'Dirección', 'Estado', 'Tracking', 'Entrega'].map((h) => (
                <th key={h} className="py-3 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {despachos.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400 italic">No se encontraron resultados</td>
              </tr>
            ) : (
              despachos.map((desp) => (
                <tr key={desp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-bold text-gray-900">{desp.despacho_id}</td>
                  <td className="py-4 px-4 text-gray-700">{desp.cliente}</td>
                  <td className="py-4 px-4 text-gray-600 text-sm max-w-[200px] truncate">{desp.direccion}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${ESTADO_STYLING[desp.estado as keyof typeof ESTADO_STYLING] || 'bg-gray-100'}`}>
                      {desp.estado}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-500 text-xs font-mono">{desp.tracking || '---'}</td>
                  <td className="py-4 px-4 text-gray-700 text-sm">{desp.fecha_entrega}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
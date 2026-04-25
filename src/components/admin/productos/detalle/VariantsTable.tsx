interface VariantsTableProps {
  variantes: any[];
}

export default function VariantsTable({ variantes }: VariantsTableProps) {
  if (!variantes || variantes.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
        <p className="text-sm text-gray-400">Este producto no tiene variantes registradas.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <th className="px-4 py-2">Atributos</th>
            <th className="px-4 py-2">SKU Específico</th>
            <th className="px-4 py-2 text-right">Stock Disponible</th>
          </tr>
        </thead>
        <tbody>
          {variantes.map((v, idx) => (
            <tr key={idx} className="group hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 bg-white border-y border-l border-gray-100 rounded-l-xl text-sm font-medium text-gray-700">
                {v.nombre_variante || "Única"}
              </td>
              <td className="px-4 py-3 bg-white border-y border-gray-100 text-xs font-mono text-gray-500">
                {v.sku || "---"}
              </td>
              <td className="px-4 py-3 bg-white border-y border-r border-gray-100 rounded-r-xl text-right">
                <span className={`text-sm font-bold ${v.stock > 0 ? 'text-green-600' : 'text-red-400'}`}>
                  {v.stock} uds
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ProductInfoDisplayProps {
  producto: any;
  categoria: string;
}

export default function ProductInfoDisplay({ producto, categoria }: ProductInfoDisplayProps) {
  const infoItems = [
    { label: "Nombre del Producto", value: producto.nombre },
    { label: "Categoría", value: categoria },
    { label: "SKU Principal", value: producto.sku },
    { label: "Precio Base", value: `$${producto.precio?.toLocaleString()}` },
    { label: "Descripción", value: producto.descripcion || "Sin descripción disponible", fullWidth: true },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {infoItems.map((item, index) => (
        <div key={index} className={item.fullWidth ? "md:col-span-2 lg:col-span-3" : ""}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            {item.label}
          </p>
          <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3">
            {item.value || "---"}
          </p>
        </div>
      ))}
    </div>
  );
}
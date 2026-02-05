'use client';

interface CartSummaryProps {
  // Propiedades que pueda necesitar
}

export default function CartSummary({}: CartSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Resumen de Compra</h2>
      <div className="space-y-2 border-b pb-4 mb-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>$0</span>
        </div>
        <div className="flex justify-between">
          <span>Envío:</span>
          <span>$0</span>
        </div>
        <div className="flex justify-between">
          <span>Impuestos:</span>
          <span>$0</span>
        </div>
      </div>
      <div className="flex justify-between text-lg font-bold">
        <span>Total:</span>
        <span>$0</span>
      </div>
    </div>
  );
}

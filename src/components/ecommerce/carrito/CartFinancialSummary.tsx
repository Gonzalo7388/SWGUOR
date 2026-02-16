'use client';

import { useMemo, useCallback } from 'react';
import { FileText, ShoppingCart, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================================
// TYPES
// ============================================================================

interface CartItem {
  id: string | number;
  nombre: string;
  precio: number;
  cantidad: number;
  talla?: string;
  color?: string;
  imagen?: string;
}

interface CartFinancialSummaryProps {
  items: CartItem[];
  onFinalizarPedido?: () => void;
}

interface FinancialCalculation {
  subtotal: number;
  igv: number;
  total: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const IGV_RATE = 0.18; // 18% - Debería venir de configuración del backend
const COMPANY_NAME = 'Modas y Estilos GUOR';
const QUOTE_VALIDITY_DAYS = 7;

// ============================================================================
// UTILITIES
// ============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CartFinancialSummary({ 
  items, 
  onFinalizarPedido 
}: CartFinancialSummaryProps) {
  
  // ============================================================================
  // CALCULATIONS
  // ============================================================================
  
  const calculations: FinancialCalculation = useMemo(() => {
    const subtotal = items.reduce((acc, item) => {
      const itemTotal = Number(item.precio) * Number(item.cantidad);
      return acc + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);
    
    const igv = subtotal * IGV_RATE;
    const total = subtotal + igv;
    
    return { subtotal, igv, total };
  }, [items]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleExportPDF = useCallback(() => {
    try {
      const doc = new jsPDF();
      const fecha = new Date();
      const fechaStr = formatDate(fecha);

      // Header with logo space
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(33, 33, 33);
      doc.text('COTIZACIÓN', 105, 25, { align: 'center' });

      // Company info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(COMPANY_NAME, 14, 40);
      doc.text(`Fecha de emisión: ${fechaStr}`, 14, 46);
      doc.text(`Válido por ${QUOTE_VALIDITY_DAYS} días`, 14, 52);

      // Products table
      autoTable(doc, {
        startY: 62,
        head: [['Producto', 'Talla', 'Color', 'Cant.', 'P. Unit.', 'Subtotal']],
        body: items.map(item => [
          item.nombre,
          item.talla || '-',
          item.color || '-',
          item.cantidad.toString(),
          formatCurrency(item.precio),
          formatCurrency(item.precio * item.cantidad),
        ]),
        headStyles: {
          fillColor: [212, 148, 90], // Primary color from logo
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        theme: 'striped',
      });

      // Financial summary
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      
      doc.text('Subtotal:', 140, finalY);
      doc.text(formatCurrency(calculations.subtotal), 200, finalY, { align: 'right' });
      
      doc.text('IGV (18%):', 140, finalY + 7);
      doc.text(formatCurrency(calculations.igv), 200, finalY + 7, { align: 'right' });
      
      // Total
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(33, 33, 33);
      doc.text('TOTAL:', 140, finalY + 17);
      doc.text(formatCurrency(calculations.total), 200, finalY + 17, { align: 'right' });

      // Footer notes
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('* Precios sujetos a disponibilidad de stock.', 14, finalY + 35);
      doc.text(`* Cotización válida hasta ${formatDate(new Date(fecha.getTime() + QUOTE_VALIDITY_DAYS * 24 * 60 * 60 * 1000))}`, 14, finalY + 41);

      // Save
      doc.save(`Cotizacion_${COMPANY_NAME.replace(/\s/g, '_')}_${fechaStr.replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error('[CartSummary] PDF export error:', error);
      alert('Error al generar el PDF. Por favor intenta nuevamente.');
    }
  }, [items, calculations]);

  const handleFinalizarPedido = useCallback(() => {
    if (onFinalizarPedido) {
      onFinalizarPedido();
    }
  }, [onFinalizarPedido]);

  // ============================================================================
  // RENDER: EMPTY STATE
  // ============================================================================

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-sm text-gray-600">No hay productos en el carrito</p>
      </div>
    );
  }

  // ============================================================================
  // RENDER: SUMMARY
  // ============================================================================

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-medium text-gray-900">
          Resumen de pago
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {items.length} {items.length === 1 ? 'producto' : 'productos'}
        </p>
      </div>

      {/* Financial Details */}
      <div className="p-6 space-y-4">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(calculations.subtotal)}
          </span>
        </div>

        {/* IGV */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">IGV (18%)</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(calculations.igv)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(calculations.total)}
            </span>
          </div>
        </div>

        {/* Info Note */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed">
            Al finalizar el pedido, un asesor se contactará contigo para coordinar los detalles del envío.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 p-6 space-y-3">
        {/* Download Quote */}
        <button
          onClick={handleExportPDF}
          className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Descargar cotización
        </button>

        {/* Finalize Order */}
        <button
          onClick={handleFinalizarPedido}
          className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg text-sm font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg"
        >
          Finalizar orden
        </button>
      </div>

      {/* Footer Note */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Cotización válida por {QUOTE_VALIDITY_DAYS} días · Precios sujetos a disponibilidad
        </p>
      </div>
    </div>
  );
}
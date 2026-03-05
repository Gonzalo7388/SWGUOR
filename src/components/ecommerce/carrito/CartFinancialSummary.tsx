'use client';

import { useMemo, useCallback } from 'react';
import { FileText, ShoppingCart, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  cliente?: {
    razon_social?: string;
    ruc?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
  };
}

interface FinancialCalculation {
  subtotal: number;
  igv: number;
  total: number;
}

const IGV_RATE = 0.18;
const QUOTE_VALIDITY_DAYS = 7;

const COMPANY = {
  nombre: 'MODAS Y ESTILOS GUOR S.A.C.',
  ruc: '20555924624',
  direccion: 'Rio Sta. Fe 590, Lima 15434, Perú',
  telefono: '+51 908 801 912',
  email: 'modasyestilosguor@gmail.com',
  web: 'www.modas-y-estilos-guor.pe',
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(amount);

const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);

const PINK: [number, number, number]       = [219, 39, 119];
const CREAM: [number, number, number]      = [255, 246, 228];
const DARK: [number, number, number]       = [33, 33, 33];
const GRAY: [number, number, number]       = [100, 100, 100];
const LIGHT_GRAY: [number, number, number] = [245, 245, 245];
const WHITE: [number, number, number]      = [255, 255, 255];
const BOX_BG: [number, number, number]     = [252, 252, 252];  // fondo cajas
const BOX_BORDER: [number, number, number] = [220, 220, 220];  // borde cajas

const buildQuotePDF = async (
  items: CartItem[],
  calculations: FinancialCalculation,
  cliente?: CartFinancialSummaryProps['cliente']
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.width;
  const fecha = new Date();
  const cotizacionNum = `COT-${Date.now().toString().slice(-6)}`;
  const validoHasta = new Date(fecha.getTime() + QUOTE_VALIDITY_DAYS * 86400000);

  // ── HEADER ───────────────────────────────────────────────────────────────
  doc.setFillColor(...CREAM);
  doc.rect(0, 0, W, 38, 'F');
  doc.setDrawColor(...PINK);
  doc.setLineWidth(0.8);
  doc.line(0, 38, W, 38);

  try {
    const img = new Image();
    img.src = '/logo.png';
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
    doc.addImage(img, 'PNG', 10, 5, 28, 28);
  } catch {
    doc.setFontSize(9);
    doc.setTextColor(...PINK);
    doc.setFont('helvetica', 'bold');
    doc.text('GUOR', 14, 22);
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PINK);
  doc.text(COMPANY.nombre, 44, 17);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(`RUC: ${COMPANY.ruc}  |  ${COMPANY.telefono}  |  ${COMPANY.email}`, 44, 24);
  doc.text(`${COMPANY.direccion}  |  ${COMPANY.web}`, 44, 30);

  // ── TÍTULO ────────────────────────────────────────────────────────────────
  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(0, 38, W, 14, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('COTIZACIÓN', 14, 48);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(`N°: ${cotizacionNum}`, W - 14, 44, { align: 'right' });
  doc.text(`Fecha: ${formatDate(fecha)}`, W - 14, 50, { align: 'right' });
  doc.text(`Válido hasta: ${formatDate(validoHasta)}`, W - 14, 56, { align: 'right' });

  // ── DATOS CLIENTE / CONDICIONES ──────────────────────────────────────────
  const boxTop = 58;
  const boxH   = 36;
  const colMid = W / 2;

  // Caja izquierda: DATOS DEL CLIENTE
  doc.setFillColor(...BOX_BG);
  doc.setDrawColor(...BOX_BORDER);
  doc.roundedRect(10, boxTop, colMid - 15, boxH, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PINK);
  doc.text('DATOS DEL CLIENTE', 14, boxTop + 7);
  const cn = cliente?.razon_social || 'Cliente General';
  const cr = cliente?.ruc          || '—';
  const ct = cliente?.telefono     || '—';
  const ce = cliente?.email        || '—';
  const cd = cliente?.direccion    || '—';
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text(cn, 14, boxTop + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`RUC: ${cr}`, 14, boxTop + 20);
  doc.text(`Tel: ${ct}  |  ${ce}`, 14, boxTop + 26);
  doc.text(`Dir: ${cd}`, 14, boxTop + 32);

  // Caja derecha: CONDICIONES  ← resetear colores explícitamente
  doc.setFillColor(...BOX_BG);
  doc.setDrawColor(...BOX_BORDER);
  doc.roundedRect(colMid, boxTop, colMid - 10, boxH, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PINK);
  doc.text('CONDICIONES', colMid + 4, boxTop + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK);
  doc.text(`Moneda: Soles (PEN)`,              colMid + 4, boxTop + 14);
  doc.text(`Vigencia: ${QUOTE_VALIDITY_DAYS} días calendario`, colMid + 4, boxTop + 20);
  doc.text(`IGV: 18% incluido`,                colMid + 4, boxTop + 26);
  doc.text(`Forma de pago: A convenir`,         colMid + 4, boxTop + 32);

  // ── TABLA DE PRODUCTOS ────────────────────────────────────────────────────
  autoTable(doc, {
    startY: boxTop + boxH + 6,
    head: [['#', 'Descripción', 'Talla', 'Color', 'Cant.', 'P. Unit.', 'Total']],
    body: items.map((item, i) => [
      (i + 1).toString(),
      item.nombre,
      item.talla || '-',
      item.color || '-',
      item.cantidad.toString(),
      formatCurrency(item.precio),
      formatCurrency(item.precio * item.cantidad),
    ]),
    headStyles: { fillColor: PINK, textColor: WHITE, fontSize: 9, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 8.5, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 8,  halign: 'center' },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 26, halign: 'right' },
      6: { cellWidth: 26, halign: 'right' },
    },
    alternateRowStyles: { fillColor: [252, 245, 250] },
    theme: 'striped',
    margin: { left: 10, right: 10 },
  });

  // ── TOTALES ───────────────────────────────────────────────────────────────
  const finalY = (doc as any).lastAutoTable.finalY + 6;
  const boxW   = 75;
  const boxX   = W - boxW - 10;

  doc.setFillColor(...LIGHT_GRAY);
  doc.setDrawColor(...BOX_BORDER);
  doc.roundedRect(boxX, finalY, boxW, 32, 2, 2, 'FD');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text('Subtotal:', boxX + 4, finalY + 9);
  doc.text(formatCurrency(calculations.subtotal), boxX + boxW - 4, finalY + 9, { align: 'right' });
  doc.text('IGV (18%):', boxX + 4, finalY + 17);
  doc.text(formatCurrency(calculations.igv), boxX + boxW - 4, finalY + 17, { align: 'right' });

  doc.setFillColor(...PINK);
  doc.roundedRect(boxX, finalY + 22, boxW, 10, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text('TOTAL:', boxX + 4, finalY + 29);
  doc.text(formatCurrency(calculations.total), boxX + boxW - 4, finalY + 29, { align: 'right' });

  // ── OBSERVACIONES ────────────────────────────────────────────────────────
  const notaY = finalY + 38;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('OBSERVACIONES:', 10, notaY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text('• Precios sujetos a disponibilidad de stock.', 10, notaY + 6);
  doc.text(`• Cotización válida hasta el ${formatDate(validoHasta)}.`, 10, notaY + 12);
  doc.text('• Para confirmar el pedido, comuníquese con nuestro equipo de ventas.', 10, notaY + 18);

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.height;
  doc.setFillColor(...PINK);
  doc.rect(0, pageH - 16, W, 16, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...WHITE);
  doc.text(`${COMPANY.telefono}  |  ${COMPANY.email}  |  ${COMPANY.web}`, W / 2, pageH - 7, { align: 'center' });

  doc.save(`Cotizacion_GUOR_${cotizacionNum}_${formatDate(fecha).replace(/\//g, '-')}.pdf`);
};

export default function CartFinancialSummary({ items, onFinalizarPedido, cliente }: CartFinancialSummaryProps) {
  const calculations: FinancialCalculation = useMemo(() => {
    const subtotal = items.reduce((acc, item) => {
      const t = Number(item.precio) * Number(item.cantidad);
      return acc + (isNaN(t) ? 0 : t);
    }, 0);
    return { subtotal, igv: subtotal * IGV_RATE, total: subtotal * (1 + IGV_RATE) };
  }, [items]);

  const handleExportPDF = useCallback(async () => {
    try {
      await buildQuotePDF(items, calculations, cliente);
    } catch (err) {
      console.error('[CartSummary] PDF error:', err);
      alert('Error al generar el PDF. Intenta nuevamente.');
    }
  }, [items, calculations, cliente]);

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

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-medium text-gray-900">Resumen de pago</h2>
        <p className="text-sm text-gray-500 mt-1">
          {items.length} {items.length === 1 ? 'producto' : 'productos'}
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">{formatCurrency(calculations.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">IGV (18%)</span>
          <span className="font-medium text-gray-900">{formatCurrency(calculations.igv)}</span>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(calculations.total)}</span>
          </div>
        </div>
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed">
            Al finalizar el pedido, un asesor se contactará contigo para coordinar los detalles del envío.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 p-6 space-y-3">
        <button
          onClick={handleExportPDF}
          className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Descargar cotización
        </button>
        <button
          onClick={onFinalizarPedido}
          className="w-full px-4 py-3 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-lg text-sm font-semibold hover:from-pink-700 hover:to-pink-800 transition-all shadow-md hover:shadow-lg"
        >
          Finalizar orden
        </button>
      </div>

      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Cotización válida por {QUOTE_VALIDITY_DAYS} días · Precios sujetos a disponibilidad
        </p>
      </div>
    </div>
  );
}
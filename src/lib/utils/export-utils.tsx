import * as XLSX from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { pdf, Document, Page, Text, View, StyleSheet, Image as PdfImage } from '@react-pdf/renderer';
import { ProductoStockResumen } from '@/lib/hooks/useStockResumen';

// =====================================================
// INTERFACES Y TIPOS
// =====================================================

interface ExcelExportConfig {
  filename: string;
  sheetName?: string;
}

interface PDFExportConfig {
  filename: string;
  title: string;
  subtitle?: string;
  includeDate?: boolean;
  orientation?: 'portrait' | 'landscape';
}

interface PDFImageConfig extends PDFExportConfig {
  imageColumn?: number;
  imageKey?: string;
  imageWidth?: number;
  imageHeight?: number;
  excludeFields?: string[];
}

// =====================================================
// HELPERS DE UTILIDAD
// =====================================================

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
  }).format(amount);
};

// Carga el logo y lo añade al documento con un fondo corporativo (Versión Segura)
const drawHeaderWithLogo = async (doc: jsPDF, title: string, subtitle?: string): Promise<number> => {
  const exactBgColor = [255, 246, 228];
  const pinkGUOR = [219, 39, 119];
  const pageWidth = doc.internal.pageSize.width;

  try {
    doc.setFillColor(exactBgColor[0], exactBgColor[1], exactBgColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');

    const img = new Image();
    img.src = '/logo.png';

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      setTimeout(() => reject(new Error("Timeout loading logo")), 1500);
    });

    doc.addImage(img, 'PNG', 14, 8, 22, 22);

    doc.setFontSize(20);
    doc.setTextColor(pinkGUOR[0], pinkGUOR[1], pinkGUOR[2]);
    doc.text(title, 42, 18);

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    if (subtitle) {
      doc.text(subtitle, 42, 25);
      doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, 42, 31);
    } else {
      doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, 42, 25);
    }

    return 48;
  } catch (e) {
    console.warn("No se pudo cargar el logo, generando encabezado de texto...");
    doc.setFontSize(18);
    doc.setTextColor(pinkGUOR[0], pinkGUOR[1], pinkGUOR[2]);
    doc.text(title, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, 14, 28);
    return 35;
  }
};

// =====================================================
// EXPORTACIÓN A EXCEL - GENÉRICO
// =====================================================

export const exportToExcel = async (data: any[], config: ExcelExportConfig) => {
  if (data.length === 0) return;

  const workbook = new XLSX.Workbook();
  const worksheet = workbook.addWorksheet(config.sheetName || "Datos");

  const keys = Object.keys(data[0]);
  worksheet.columns = keys.map(key => ({
    header: key,
    key: key,
    width: 20
  }));

  data.forEach(row => worksheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const fecha = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `${config.filename}_${fecha}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};

// =====================================================
// EXPORTACIÓN A EXCEL - INVENTARIO DE PRODUCTOS
// =====================================================

export const prepareProductosForExcel = (
  productos: any[],
  stockResumen: ProductoStockResumen[] = []
) => {
  return productos.map(p => ({
    'SKU':          p.sku || '---',
    'Producto':     p.nombre || '---',
    'Categoría':    p.categorias?.nombre || 'General',
    'Stock Real':   stockResumen.find(s => s.producto_id === Number(p.id))?.stock_total_adicional ?? p.stock ?? 0,
    'Precio (S/.)': Number(p.precio || 0).toFixed(2),
    'Estado':       p.estado === 'activo' ? 'Activo' : 'Inactivo',
  }));
};

export const exportProductosToExcel = async (
  productos: any[],
  stockResumen: ProductoStockResumen[] = [],
  filename: string
) => {
  const data = prepareProductosForExcel(productos, stockResumen);
  await exportToExcel(data, { filename, sheetName: 'Inventario' });
};

// =====================================================
// EXPORTACIÓN A PDF - CATEGORIAS
// =====================================================

const CategoriasDocument = ({ data, config }: any) => {
  const colWidths = ['25%', '40%', '15%', '20%'];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.subtitle}>Directorio Oficial - Modas y Estilos GUOR</Text>
            <Text style={styles.subtitle}>Generado: {new Date().toLocaleString('es-PE')}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            {['CATEGORÍA', 'DESCRIPCIÓN', 'ESTADO', 'CREACIÓN'].map((header, i) => (
              <View key={i} style={[styles.tableColHeader, { width: colWidths[i] }]}>
                <Text style={styles.tableCellHeader}>{header}</Text>
              </View>
            ))}
          </View>

          {data.map((item: any, rowIndex: number) => (
            <View key={rowIndex} style={rowIndex % 2 === 0 ? styles.tableRow : styles.tableRowStriped}>
              <View style={[styles.tableCol, { width: colWidths[0] }]}>
                <Text style={styles.tableCell}>{item.nombre || "---"}</Text>
              </View>
              <View style={[styles.tableCol, { width: colWidths[1] }]}>
                <Text style={styles.tableCell}>{item.descripcion || "Sin descripción"}</Text>
              </View>
              <View style={[styles.tableCol, { width: colWidths[2] }]}>
                <Text style={styles.tableCell}>{item.activo ? "Activa" : "Inactiva"}</Text>
              </View>
              <View style={[styles.tableCol, { width: colWidths[3] }]}>
                <Text style={styles.tableCell}>{new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export const exportCategoriasToPDF = async (data: any[], config: { title: string; filename: string }) => {
  if (!data || data.length === 0) return;

  const asPdf = pdf();
  asPdf.updateContainer(<CategoriasDocument data={data} config={config} />);
  const blob = await asPdf.toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${config.filename}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};

// =====================================================
// EXPORTACIÓN A PDF - SIMPLE
// =====================================================

export const exportToPDF = async (
  headers: string[][],
  body: any[][],
  config: PDFExportConfig
) => {
  const doc = new jsPDF({ orientation: config.orientation || 'portrait' });
  const startY = await drawHeaderWithLogo(doc, config.title, config.subtitle);

  autoTable(doc, {
    head: headers,
    body: body,
    startY: startY,
    styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
    headStyles: { fillColor: [219, 39, 119], textColor: 255 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    rowPageBreak: 'auto',
    showHead: 'everyPage',
    margin: { top: 40, bottom: 20 }
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`GUOR S.A.C. - Página ${i} de ${totalPages}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  }

  doc.save(`${config.filename}.pdf`);
};

// =====================================================
// ESTILOS COMPARTIDOS (@react-pdf/renderer)
// =====================================================

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF6E4', padding: 15, marginBottom: 20, borderRadius: 5 },
  logo: { width: 40, height: 40, marginRight: 15 },
  headerText: { display: 'flex', flexDirection: 'column' },
  title: { fontSize: 18, color: '#db2777', fontWeight: 'bold' },
  subtitle: { fontSize: 10, color: '#555', marginTop: 3 },
  table: { width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#eee', borderBottomWidth: 0, borderRightWidth: 0 },
  tableRow: { flexDirection: 'row' },
  tableRowStriped: { flexDirection: 'row', backgroundColor: '#f9fafb' },
  tableColHeader: { borderStyle: 'solid', borderWidth: 1, borderColor: '#eee', borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#db2777', padding: 6 },
  tableCol: { borderStyle: 'solid', borderWidth: 1, borderColor: '#eee', borderLeftWidth: 0, borderTopWidth: 0, padding: 6, justifyContent: 'center' },
  tableCellHeader: { color: 'white', fontSize: 8, fontWeight: 'bold' },
  tableCell: { fontSize: 8, color: '#333' },
  badgeAgotado: { fontSize: 7, color: '#dc2626', backgroundColor: '#fef2f2', padding: 2, borderRadius: 3 },
  badgeBajo:    { fontSize: 7, color: '#d97706', backgroundColor: '#fffbeb', padding: 2, borderRadius: 3 },
  badgeDisp:    { fontSize: 7, color: '#16a34a', backgroundColor: '#f0fdf4', padding: 2, borderRadius: 3 },
});

// =====================================================
// EXPORTACIÓN A PDF - INVENTARIO (@react-pdf/renderer)
// =====================================================

const InventarioDocument = ({ data, categorias, config }: any) => {
  const colWidths = ['15%', '35%', '20%', '10%', '10%', '10%'];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.subtitle}>Modas y Estilos GUOR</Text>
            <Text style={styles.subtitle}>Generado: {new Date().toLocaleString('es-PE')}</Text>
          </View>
        </View>

        {/* TABLA */}
        <View style={styles.table}>
          {/* Cabecera */}
          <View style={styles.tableRow}>
            {['SKU', 'PRODUCTO', 'CATEGORÍA', 'STOCK', 'PRECIO', 'ESTADO'].map((header, i) => (
              <View key={i} style={[styles.tableColHeader, { width: colWidths[i] }]}>
                <Text style={styles.tableCellHeader}>{header}</Text>
              </View>
            ))}
          </View>

          {/* Filas */}
          {data.map((item: any, rowIndex: number) => {
            const cat = categorias.find(
              (c: any) => String(c.id).replace(/\D/g, '') === String(item.categoria_id).replace(/\D/g, '')
            )?.nombre || "General";

            const stockVal = Number(item.stock ?? 0);
            const estLabel = stockVal === 0 ? "Agotado" : stockVal <= 5 ? "Bajo" : "Disponible";
            const estStyle = stockVal === 0 ? styles.badgeAgotado : stockVal <= 5 ? styles.badgeBajo : styles.badgeDisp;

            const pre = `S/ ${Number(item.precio || 0).toFixed(2)}`;

            return (
              <View key={rowIndex} style={rowIndex % 2 === 0 ? styles.tableRow : styles.tableRowStriped}>
                <View style={[styles.tableCol, { width: colWidths[0] }]}>
                  <Text style={styles.tableCell}>{item.sku || "---"}</Text>
                </View>
                <View style={[styles.tableCol, { width: colWidths[1] }]}>
                  <Text style={styles.tableCell}>{item.nombre || "---"}</Text>
                </View>
                <View style={[styles.tableCol, { width: colWidths[2] }]}>
                  <Text style={styles.tableCell}>{cat}</Text>
                </View>
                <View style={[styles.tableCol, { width: colWidths[3] }]}>
                  <Text style={styles.tableCell}>{stockVal}</Text>
                </View>
                <View style={[styles.tableCol, { width: colWidths[4] }]}>
                  <Text style={styles.tableCell}>{pre}</Text>
                </View>
                <View style={[styles.tableCol, { width: colWidths[5] }]}>
                  <Text style={estStyle}>{estLabel}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
};

export const exportInventarioToPDF = async (data: any[], categorias: any[], config: PDFExportConfig) => {
  if (!data || data.length === 0) return;

  const asPdf = pdf();
  asPdf.updateContainer(<InventarioDocument data={data} categorias={categorias} config={config} />);
  const blob = await asPdf.toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${config.filename}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};

// =====================================================
// EXPORTACIÓN A PDF - CON IMÁGENES (CATÁLOGO)
// =====================================================

export const exportToPDFWithImages = async (
  data: any[],
  config: PDFImageConfig
) => {
  if (data.length === 0) return;
  const doc = new jsPDF({ orientation: config.orientation || 'portrait' });

  const startY = await drawHeaderWithLogo(doc, config.title, config.subtitle);
  const imageKey = config.imageKey || 'imagen';
  const excludeFields = config.excludeFields || ['id', 'created_at'];

  const getImageData = (imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      if (!imageUrl) return resolve("NO_IMAGE");
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const MAX_WIDTH = 100;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.onerror = () => resolve("NO_IMAGE");
      setTimeout(() => resolve("NO_IMAGE"), 2000);
    });
  };

  const displayKeys = Object.keys(data[0]).filter(key => !excludeFields.includes(key));

  const tableRows = await Promise.all(data.map(async (item) => {
    return await Promise.all(displayKeys.map(async (key) => {
      if (key === imageKey) return await getImageData(item[key]);
      return item[key]?.toString() || '-';
    }));
  }));

  const headers = displayKeys.map(key =>
    key === imageKey ? 'Imagen' : key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
  );

  const imageColIndex = displayKeys.indexOf(imageKey);

  autoTable(doc, {
    head: [headers],
    body: tableRows,
    startY: startY + 5,
    styles: { valign: 'middle', fontSize: 8 },
    columnStyles: {
      [imageColIndex]: { cellWidth: 30, fontSize: 0.1, textColor: [255, 246, 228] }
    },
    headStyles: { fillColor: [219, 39, 119] },
    didDrawCell: (data) => {
      if (data.column.index === imageColIndex && data.cell.section === 'body') {
        const imgRaw = data.cell.raw as string;
        if (imgRaw && imgRaw.startsWith("data:image")) {
          doc.addImage(imgRaw, 'JPEG', data.cell.x + 5, data.cell.y + 2, 20, 20);
        }
      }
    },
    didParseCell: (data) => {
      if (data.section === 'body') data.row.height = 25;
    }
  });

  doc.save(`${config.filename}.pdf`);
};

// =====================================================
// HELPERS ESPECÍFICOS DE PREPARACIÓN
// =====================================================

export const exportProductosToPDFWithImages = async (productos: any[]) => {
  const productosFiltrados = productos.filter(p => Number(p.stock) > 400);

  if (productosFiltrados.length === 0) {
    throw new Error("No hay productos con stock superior a 400 unidades.");
  }

  const data = productosFiltrados.map(p => ({
    imagen: p.imagen_url,
    sku: p.sku,
    nombre: p.nombre,
    categoria: p.categorias?.nombre || 'General',
    precio: formatCurrency(Number(p.precio)),
    stock: p.stock.toString()
  }));

  await exportToPDFWithImages(data, {
    filename: `Catalogo_Productos_GUOR`,
    title: "CATÁLOGO DE PRODUCTOS",
    subtitle: "Inventario oficial Modas y Estilos GUOR",
    imageKey: 'imagen'
  });
};

export const prepareVentasForPDF = (ventas: any[]) => {
  const headers = [["CÓDIGO", "CLIENTE", "FECHA", "ESTADO", "TOTAL"]];
  const body = ventas.map(v => [
    v.codigo_pedido,
    v.cliente?.nombre || 'Público General',
    new Date(v.created_at).toLocaleDateString('es-PE'),
    v.estado_pedido.toUpperCase(),
    formatCurrency(Number(v.total))
  ]);
  return { headers, body };
};

export const prepareVentasForExcel = (ventas: any[]) => {
  return ventas.map(v => ({
    'Código': v.codigo_pedido,
    'Cliente': v.cliente?.nombre || 'Público General',
    'Fecha': new Date(v.created_at).toLocaleDateString('es-PE'),
    'Subtotal': Number(v.subtotal),
    'Total': Number(v.total),
    'Estado': v.estado_pedido.toUpperCase()
  }));
};

export const prepareCategoriasForExcel = (categorias: any[]) => {
  return categorias.map(c => ({
    'Nombre de Categoría': c.nombre,
    'Descripción': c.descripcion || 'Sin descripción',
    'Estado': c.activo ? 'Activo' : 'Inactivo',
    'Fecha de Creación': new Date(c.created_at).toLocaleDateString('es-PE'),
  }));
};

export const exportVentasDetailedPDF = async (ventas: any[], config: PDFExportConfig) => {
  if (ventas.length === 0) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const startY = await drawHeaderWithLogo(doc, config.title, config.subtitle);

  let totalRecaudado = 0;
  let totalImpuestos = 0;
  const metodosPago: Record<string, number> = {};

  const body = ventas.map(v => {
    const total = Number(v.total) || 0;
    const impuesto = Number(v.impuestos) || 0;
    const subtotal = Number(v.subtotal) || (total - impuesto);
    const metodo = (v.ordenes?.metodo_pago || 'Efectivo').toUpperCase();

    totalRecaudado += total;
    totalImpuestos += impuesto;
    metodosPago[metodo] = (metodosPago[metodo] || 0) + total;

    return [
      v.numero_comprobante || `ORD-${v.orden_id}`,
      v.ordenes?.clientes?.razon_social || "PÚBLICO GENERAL",
      new Date(v.created_at).toLocaleDateString('es-PE'),
      metodo,
      v.ordenes?.estado?.toUpperCase() || 'PAGADO',
      formatCurrency(Number(subtotal)),
      formatCurrency(impuesto),
      formatCurrency(total)
    ];
  });

  const headers = [["COMPROBANTE", "CLIENTE", "RUC", "FECHA", "MÉTODO", "ESTADO", "SUBTOTAL", "IGV", "TOTAL"]];

  autoTable(doc, {
    head: headers,
    body: body,
    startY: startY,
    styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak', halign: 'center' },
    headStyles: { fillColor: [219, 39, 119], textColor: 255 },
    columnStyles: {
      1: { halign: 'left', cellWidth: 'auto' },
      7: { halign: 'right', fontStyle: 'bold' }
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: 14, right: 14 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 14;

  doc.setFillColor(245, 245, 245);
  doc.roundedRect(pageWidth - 85, finalY, 70, 40, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("RESUMEN DE CAJA", pageWidth - 80, finalY + 8);

  doc.setFontSize(8);
  doc.text(`Total Bruto:`, pageWidth - 80, finalY + 18);
  doc.text(formatCurrency(totalRecaudado - totalImpuestos), pageWidth - 30, finalY + 18, { align: 'right' });

  doc.text(`Total Impuestos:`, pageWidth - 80, finalY + 24);
  doc.text(formatCurrency(totalImpuestos), pageWidth - 30, finalY + 24, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(219, 39, 119);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL NETO:`, pageWidth - 80, finalY + 34);
  doc.text(formatCurrency(totalRecaudado), pageWidth - 30, finalY + 34, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.setFontSize(8);
  let metodoY = finalY + 8;
  doc.text("DESGLOSE POR MÉTODO:", margin, metodoY);

  Object.entries(metodosPago).forEach(([metodo, monto]) => {
    metodoY += 6;
    doc.text(`${metodo}: ${formatCurrency(monto)}`, margin + 2, metodoY);
  });

  doc.save(`${config.filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// =====================================================
// HELPERS ESPECÍFICOS PARA CONFECCIONES
// =====================================================

export const prepareConfeccionesForExcel = (data: any[]) => {
  return data.map(c => ({
    'ID Orden': c.id,
    'Cliente': c.cliente || 'Sin Cliente',
    'Taller/Proveedor': c.taller || 'Taller Interno',
    'Estado': (c.estado || 'Pendiente').toUpperCase().replace('_', ' '),
    'Fecha de Entrega': c.fecha_entrega || 'No definida',
    'Prendas Totales': c.total_prendas || 0,
    'Prioridad': c.prioridad || 'Normal'
  }));
};

export const prepareConfeccionesForPDF = (data: any[]) => {
  const headers = [["ORDEN", "CLIENTE", "TALLER", "ESTADO", "ENTREGA", "CANT."]];
  const body = data.map(c => [
    `#${c.id}`,
    c.cliente || 'N/A',
    c.taller || 'Interno',
    (c.estado || 'Pendiente').toUpperCase(),
    c.fecha_entrega || 'Pnd.',
    c.total_prendas || 0
  ]);
  return { headers, body };
};

export const exportConfeccionesDetailedPDF = async (data: any[], config: PDFExportConfig) => {
  if (!data || data.length === 0) return;

  const doc = new jsPDF({ orientation: config.orientation || 'portrait', unit: 'mm', format: 'a4' });
  const startY = await drawHeaderWithLogo(doc, config.title, config.subtitle);

  const stats = {
    total: data.length,
    prendas: data.reduce((acc, curr) => acc + (Number(curr.total_prendas) || 0), 0),
    enProceso: data.filter(c => ['cortando', 'confeccionando', 'escalado'].includes(c.estado)).length
  };

  const { headers, body } = prepareConfeccionesForPDF(data);

  autoTable(doc, {
    head: headers,
    body: body,
    startY: startY,
    styles: { fontSize: 8, cellPadding: 3, halign: 'center' },
    headStyles: { fillColor: [219, 39, 119], textColor: 255 },
    columnStyles: {
      1: { halign: 'left', cellWidth: 'auto' },
      2: { halign: 'left' }
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const pageWidth = doc.internal.pageSize.width;

  doc.setFillColor(245, 245, 245);
  doc.roundedRect(14, finalY, pageWidth - 28, 25, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text("RESUMEN OPERATIVO DE TALLERES", 20, finalY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Total Órdenes: ${stats.total}`, 20, finalY + 17);
  doc.text(`Total Prendas a Confeccionar: ${stats.prendas}`, 70, finalY + 17);
  doc.text(`Órdenes en Proceso Activo: ${stats.enProceso}`, 130, finalY + 17);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `MODAS Y ESTILOS GUOR - Sistema de Producción - Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`${config.filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};


// =====================================================
// EXPORTACIÓN A PDF - COTIZACIONES
// =====================================================

const CotizacionesDocument = ({ data, config }: any) => {
  const colWidths = ['18%', '22%', '15%', '12%', '13%', '20%'];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.subtitle}>Reporte Comercial - Modas y Estilos GUOR</Text>
            <Text style={styles.subtitle}>Generado: {new Date().toLocaleString('es-PE')}</Text>
          </View>
        </View>
        
        <View style={styles.table}>
          <View style={styles.tableRow}>
            {['N° COT.', 'CLIENTE', 'MONTO', 'ESTADO', 'VENCIMIENTO', 'DESCRIPCIÓN'].map((header, i) => (
              <View key={i} style={[styles.tableColHeader, { width: colWidths[i] }]}>
                <Text style={styles.tableCellHeader}>{header}</Text>
              </View>
            ))}
          </View>

          {data.map((item: any, rowIndex: number) => (
            <View key={rowIndex} style={rowIndex % 2 === 0 ? styles.tableRow : styles.tableRowStriped}>
              <View style={[styles.tableCol, { width: colWidths[0] }]}>
                <Text style={styles.tableCell}>{item.cotizacion_id || '---'}</Text>
              </View>
              <View style={[styles.tableCol, { width: colWidths[1] }]}>
                <Text style={styles.tableCell}>{item.cliente || 'Sin cliente'}</Text>
              </View>
              <View style={[styles.tableCol, { width: colWidths[2] }]}>
                <Text style={styles.tableCell}>
                  {`S/ ${Number(item.monto || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: colWidths[3] }]}>
                <Text style={styles.tableCell}>{(item.estado || 'borrador').toUpperCase()}</Text>
              </View>
              <View style={[styles.tableCol, { width: colWidths[4] }]}>
                <Text style={styles.tableCell}>{item.fecha_vencimiento || '---'}</Text>
              </View>
              <View style={[styles.tableCol, { width: colWidths[5] }]}>
                <Text style={styles.tableCell}>{item.descripcion || '---'}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export const exportCotizacionesToPDF = async (
  data: any[],
  config: { title: string; filename: string }
) => {
  if (!data || data.length === 0) return;

  const asPdf = pdf();
  asPdf.updateContainer(<CotizacionesDocument data={data} config={config} />);
  const blob = await asPdf.toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${config.filename}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};

// =====================================================
// EXPORTACIÓN PERSONAL — EXCEL
// =====================================================
 
const CARGO_LABELS_MAP: Record<string, string> = {
  gerente:              'Gerente',
  disenador:            'Diseñador',
  cortador:             'Cortador',
  recepcionista:        'Recepcionista',
  administrador:        'Administrador',
  ayudante:             'Ayudante',
  representante_taller: 'Rep. de Taller',
};
 
export const exportPersonalToExcel = async (data: any[], config?: { filename?: string }) => {
  if (!data || data.length === 0) return;
  const rows = data.map(p => ({
    'NOMBRE COMPLETO':  p.nombre_completo ?? '—',
    'CARGO':            CARGO_LABELS_MAP[p.cargo] ?? p.cargo ?? '—',
    'DNI':              p.dni             ?? '—',
    'TELÉFONO':         p.telefono        ?? '—',
    'EMAIL':            p.usuarios?.email ?? '—',
    'ROL SISTEMA':      p.usuarios?.rol   ?? '—',
    'ESTADO':           p.estado !== false ? 'ACTIVO' : 'INACTIVO',
    'FECHA INGRESO':    p.fecha_ingreso
      ? new Date(p.fecha_ingreso).toLocaleDateString('es-PE')
      : '—',
    'ÚLTIMO ACCESO':    p.usuarios?.ultimo_acceso
      ? new Date(p.usuarios.ultimo_acceso).toLocaleDateString('es-PE')
      : '—',
  }));
  await exportToExcel(rows, {
    filename: config?.filename ?? `Personal_GUOR_${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Personal Interno',
  });
};
 
// =====================================================
// EXPORTACIÓN PERSONAL — PDF
// =====================================================
 
export const exportPersonalToPDF = async (data: any[], config?: { filename?: string }) => {
  if (!data || data.length === 0) return;
  const headers = [["NOMBRE", "CARGO", "DNI", "TELÉFONO", "EMAIL", "ESTADO"]];
  const body = data.map(p => [
    p.nombre_completo ?? '—',
    CARGO_LABELS_MAP[p.cargo] ?? p.cargo ?? '—',
    p.dni      ?? '—',
    p.telefono ?? '—',
    p.usuarios?.email ?? '—',
    p.estado !== false ? 'ACTIVO' : 'INACTIVO',
  ]);
  await exportToPDF(headers, body, {
    title:       'REPORTE DE PERSONAL INTERNO',
    subtitle:    'Modas y Estilos GUOR S.A.C.',
    filename:    config?.filename ?? `Personal_GUOR_${new Date().toISOString().split('T')[0]}`,
    orientation: 'landscape',
  });
};
 
// =====================================================
// EXPORTACIÓN CLIENTES — EXCEL
// =====================================================
 
export const exportClientesToExcel = async (data: any[], config?: { filename?: string }) => {
  if (!data || data.length === 0) return;
  const rows = data.map(u => {
    const c = u.clientes ?? u;
    return {
      'RUC':              c.ruc              ?? '—',
      'RAZÓN SOCIAL':     c.razon_social     ?? '—',
      'NOMBRE COMERCIAL': c.nombre_comercial ?? '—',
      'EMAIL':            u.email            ?? c.email ?? '—',
      'TELÉFONO':         c.telefono         ?? '—',
      'TIPO':             (c.tipo_cliente    ?? '—').toString().toUpperCase(),
      'DIRECCIÓN FISCAL': c.direccion_fiscal ?? '—',
      'ESTADO':           (u.estado ?? c.activo ?? '—').toString().toUpperCase(),
      'REGISTRADO':       c.created_at
        ? new Date(c.created_at).toLocaleDateString('es-PE')
        : '—',
      'ÚLTIMO ACCESO':    u.ultimo_acceso
        ? new Date(u.ultimo_acceso).toLocaleDateString('es-PE')
        : '—',
    };
  });
  await exportToExcel(rows, {
    filename: config?.filename ?? `Clientes_GUOR_${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Clientes',
  });
};
 
// =====================================================
// EXPORTACIÓN CLIENTES — PDF
// =====================================================
 
export const exportClientesToPDF = async (data: any[], config?: { filename?: string }) => {
  if (!data || data.length === 0) return;
  const headers = [["RUC", "RAZÓN SOCIAL", "EMAIL", "TELÉFONO", "TIPO", "ESTADO"]];
  const body = data.map(u => {
    const c = u.clientes ?? u;
    return [
      c.ruc              ?? '—',
      c.razon_social     ?? '—',
      u.email            ?? c.email ?? '—',
      c.telefono         ?? '—',
      (c.tipo_cliente    ?? '—').toString().toUpperCase(),
      (u.estado          ?? c.activo ?? '—').toString().toUpperCase(),
    ];
  });
  await exportToPDF(headers, body, {
    title:       'DIRECTORIO DE CLIENTES',
    subtitle:    'Modas y Estilos GUOR S.A.C.',
    filename:    config?.filename ?? `Clientes_GUOR_${new Date().toISOString().split('T')[0]}`,
    orientation: 'landscape',
  });
};
 
// =====================================================
// EXPORTACIÓN CLIENTES (ClienteListItem) — EXCEL
// =====================================================

export const exportClientesListToExcel = async (
  data: any[],
  config?: { filename?: string }
) => {
  if (!data || data.length === 0) return;

  const rows = data.map((c) => ({
    'RUC':              c.ruc              ?? '—',
    'RAZÓN SOCIAL':     c.razon_social     ?? '—',
    'NOMBRE COMERCIAL': c.nombre_comercial ?? '—',
    'EMAIL':            c.email ?? c.usuarios?.email ?? '—',
    'TELÉFONO':         c.telefono         ?? '—',
    'TIPO CLIENTE':     (c.tipo_cliente    ?? '—').toString().toUpperCase(),
    'DIRECCIÓN FISCAL': c.direccion_fiscal ?? '—',
    'ESTADO':           (c.activo          ?? '—').toString().toUpperCase(),
    'ROL SISTEMA':      c.usuarios?.rol    ?? '—',
    'ÚLTIMO PEDIDO':    c.ultimo_pedido_en
      ? new Date(c.ultimo_pedido_en).toLocaleDateString('es-PE')
      : 'Sin pedidos',
    'ÚLTIMO ACCESO':    c.usuarios?.ultimo_acceso
      ? new Date(c.usuarios.ultimo_acceso).toLocaleDateString('es-PE')
      : '—',
  }));

  await exportToExcel(rows, {
    filename:  config?.filename ?? `Clientes_GUOR_${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Clientes',
  });
};

// =====================================================
// EXPORTACIÓN CLIENTES (ClienteListItem) — PDF
// =====================================================

export const exportClientesListToPDF = async (
  data: any[],
  config?: { filename?: string }
) => {
  if (!data || data.length === 0) return;

  const headers = [["RUC", "RAZÓN SOCIAL", "EMAIL", "TELÉFONO", "TIPO", "ESTADO", "ÚLTIMO PEDIDO"]];

  const body = data.map((c) => [
    c.ruc              ?? '—',
    c.razon_social     ?? '—',
    c.email ?? c.usuarios?.email ?? '—',
    c.telefono         ?? '—',
    (c.tipo_cliente    ?? '—').toString().toUpperCase(),
    (c.activo          ?? '—').toString().toUpperCase(),
    c.ultimo_pedido_en
      ? new Date(c.ultimo_pedido_en).toLocaleDateString('es-PE')
      : 'Sin pedidos',
  ]);

  await exportToPDF(headers, body, {
    title:       'DIRECTORIO DE CLIENTES',
    subtitle:    'Modas y Estilos GUOR S.A.C.',
    filename:    config?.filename ?? `Clientes_GUOR_${new Date().toISOString().split('T')[0]}`,
    orientation: 'landscape',
  });
};
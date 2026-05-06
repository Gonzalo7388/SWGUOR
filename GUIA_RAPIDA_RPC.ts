/**
 * GUÍA RÁPIDA DE USO - RPC Integration
 * 
 * Ejemplos prácticos para usar los RPC en frontend y backend
 */

// ============================================================================
// 1. FICHAS TÉCNICAS - CÁLCULO DE COSTO
// ============================================================================

// ✅ Frontend - Solicitar ficha con costo calculado
async function obtenerFichaConCosto(fichaId: number) {
  const response = await fetch(`/api/admin/fichas-tecnicas-rpc?id=${fichaId}`);
  const { data } = await response.json();
  
  console.log(`Ficha ${fichaId}:`);
  console.log(`- Versión: ${data.version}`);
  console.log(`- Costo estimado: $${data.costoCalculado}`);
  console.log(`- Detalles: ${data.fichas_tecnicas_detalle.length} items`);
  
  return data;
}

// ✅ Backend - Service
import fichasTecnicasService from '@/lib/services/fichas-tecnicas-rpc-service';

const ficha = await fichasTecnicasService.obtenerFichaTecnica(1);
const costo = await fichasTecnicasService.obtenerCostoFicha(1);

// ✅ Backend - Helper directo
import { calcularCostoFicha } from '@/lib/helpers/rpc-helpers';

const costoCalculado = await calcularCostoFicha({ fichaId: 1 });

// ============================================================================
// 2. INVENTARIO - MOVIMIENTOS Y STOCK
// ============================================================================

// ✅ Frontend - Registrar entrada de compra
async function registrarCompra(data: {
  productoId: number;
  cantidad: number;
  almacenId: number;
  costoUnitario: number;
  ordenCompraId: number;
}) {
  const response = await fetch('/api/admin/inventario-rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tipo: 'entrada',
      productoId: data.productoId,
      almacenId: data.almacenId,
      cantidad: data.cantidad,
      motivo: `Compra OC#${data.ordenCompraId}`,
      tipoReferencia: 'COMPRA',
      referenciaId: data.ordenCompraId,
      costoUnitario: data.costoUnitario,
      usuarioId: getCurrentUserId()
    })
  });

  const { data: movimiento } = await response.json();
  console.log(`Movimiento registrado: ID ${movimiento.id}`);
  return movimiento;
}

// ✅ Frontend - Consultar stock de producto
async function consultarStock(productoId: number) {
  const response = await fetch(
    `/api/admin/inventario-rpc?tipo=producto&id=${productoId}`
  );
  const { data: stocks } = await response.json();
  
  stocks.forEach(almacen => {
    console.log(`Almacén ${almacen.almacenNombre}:`);
    console.log(`- Stock: ${almacen.cantidad} unidades`);
    console.log(`- Mínimo: ${almacen.stockMinimo}`);
    console.log(`- Disponible: ${almacen.disponible}`);
  });
  
  return stocks;
}

// ✅ Frontend - Ver items con stock bajo
async function alertasStockBajo() {
  const response = await fetch('/api/admin/inventario-rpc?action=bajo-stock');
  const { data: items } = await response.json();
  
  items.forEach(item => {
    console.warn(`⚠️ ${item.tipo} '${item.nombre}': ${item.stock} / ${item.minimo}`);
  });
  
  return items;
}

// ✅ Backend - Service
import inventarioService from '@/lib/services/inventario-rpc-service';

// Registrar entrada
const movimiento = await inventarioService.registrarEntrada({
  productoId: 5,
  almacenId: 1,
  cantidad: 100,
  motivo: 'Compra OC#123',
  tipoReferencia: 'COMPRA',
  referenciaId: 123,
  usuarioId: 1,
  costoUnitario: 25.50
});

// Registrar salida
const salidaMovimiento = await inventarioService.registrarSalida({
  productoId: 5,
  almacenId: 1,
  cantidad: 10,
  motivo: 'Venta Pedido#456',
  tipoReferencia: 'VENTA',
  referenciaId: 456
});

// Obtener stock
const stocks = await inventarioService.obtenerStockProducto(5);
const items = await inventarioService.obtenerItemsConStockBajo(1);

// ============================================================================
// 3. NOTIFICACIONES - SISTEMA DE ALERTAS
// ============================================================================

// ✅ Frontend - Ver notificaciones no leídas
async function actualizarNotificaciones(usuarioId: number) {
  const response = await fetch(
    `/api/admin/notificaciones-rpc?usuarioId=${usuarioId}&action=no-leidas`
  );
  const { data: noLeidas, total } = await response.json();
  
  console.log(`📬 ${total} notificaciones no leídas:`);
  
  noLeidas.forEach(notif => {
    console.log(`
      Tipo: ${notif.tipo}
      Título: ${notif.titulo}
      Mensaje: ${notif.mensaje}
      URL: ${notif.url_destino}
    `);
  });
  
  return noLeidas;
}

// ✅ Frontend - Marcar como leída
async function marcarComoLeida(notificacionId: number) {
  const response = await fetch('/api/admin/notificaciones-rpc?action=marcar-leida', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notificacionId })
  });
  
  const { success } = await response.json();
  if (success) console.log('✅ Notificación marcada como leída');
}

// ✅ Frontend - Marcar todas como leídas
async function marcarTodas(usuarioId: number) {
  const response = await fetch(
    '/api/admin/notificaciones-rpc?action=marcar-todas-leidas',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId })
    }
  );
  
  const { success } = await response.json();
  if (success) console.log('✅ Todas marcadas como leídas');
}

// ✅ Backend - Crear notificación
import notificacionesService from '@/lib/services/notificaciones-rpc-service';

await notificacionesService.crearNotificacionNueva({
  usuarioId: 5,
  tipo: 'stock_bajo',
  titulo: 'Stock bajo: Tela Azul',
  mensaje: 'El stock de tela azul bajó a 20 metros (mínimo: 50)',
  referenciaType: 'materiales',
  referenciaId: 1,
  urlDestino: '/admin/inventario'
});

// ✅ Backend - Notificaciones de evento
// Cotización expirada
await notificacionesService.notificarCotizacionExpirada({
  cotizacionId: 10,
  cotizacionNumero: 'COT-2026-001'
});

// Stock bajo
await notificacionesService.notificarStockBajo({
  itemId: 1,
  itemNombre: 'Tela Azul',
  stockActual: 20,
  stockMinimo: 50,
  tipoItem: 'material'
});

// Devolución solicitada
await notificacionesService.notificarDevolucionSolicitada({
  devolucionId: 5,
  clienteId: 10,
  productoNombre: 'Prenda A'
});

// Pago pendiente a taller
await notificacionesService.notificarPagoPendiente({
  confeccionId: 15,
  tallerNombre: 'Taller San José',
  monto: 500
});

// ============================================================================
// 4. AUDITORÍA - HISTORIAL DE CAMBIOS
// ============================================================================

// ✅ Frontend - Ver auditoría de registro
async function verAuditoriaFicha(fichaId: number) {
  const response = await fetch(
    `/api/admin/auditoria-operaciones-rpc?action=registro&tabla=fichas_tecnicas&registroId=${fichaId}`
  );
  const { data: auditorias } = await response.json();
  
  auditorias.forEach(aud => {
    console.log(`
      Acción: ${aud.accion}
      Usuario: ${aud.usuarios?.email}
      Fecha: ${aud.created_at}
      Antes: ${JSON.stringify(aud.datos_antes)}
      Después: ${JSON.stringify(aud.datos_despues)}
    `);
  });
  
  return auditorias;
}

// ✅ Frontend - Ver auditoría reciente
async function verAuditoriaReciente() {
  const response = await fetch('/api/admin/auditoria-operaciones-rpc?action=reciente');
  const { data: cambios } = await response.json();
  
  console.log(`📋 Últimos ${cambios.length} cambios en el sistema:`);
  cambios.forEach(cambio => {
    console.log(`${cambio.tabla} - ${cambio.accion} por ${cambio.usuarios?.email}`);
  });
  
  return cambios;
}

// ✅ Backend - Helper directo
import { obtenerAuditoriaRegistro, obtenerAuditoriaReciente } from '@/lib/helpers/rpc-helpers';

const auditorias = await obtenerAuditoriaRegistro('fichas_tecnicas', 1);
const reciente = await obtenerAuditoriaReciente(100);

// ============================================================================
// 5. CAMBIOS DE ESTADO CON AUDITORÍA AUTOMÁTICA
// ============================================================================

// ✅ Frontend - Aprobar ficha técnica
async function aprobarFicha(fichaId: number, usuarioId: number) {
  const response = await fetch('/api/admin/auditoria-operaciones-rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operacion: 'aprobar-ficha',
      fichaId,
      usuarioId
    })
  });
  
  const { data, success } = await response.json();
  if (success) {
    console.log('✅ Ficha técnica aprobada');
    console.log('Estado:', data.estado);
  }
}

// ✅ Frontend - Marcar ficha como obsoleta
async function marcarObsoleta(fichaId: number) {
  const response = await fetch('/api/admin/auditoria-operaciones-rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operacion: 'obsoleta-ficha',
      fichaId
    })
  });
  
  const { success } = await response.json();
  if (success) console.log('✅ Ficha marcada como obsoleta');
}

// ============================================================================
// 6. VALIDACIÓN CON ZOD SCHEMAS
// ============================================================================

import {
  CalcularCostoFichaSchema,
  CrearReservaStockSchema,
  InsertarMovimientoSchema
} from '@/lib/schemas/rpc-schemas';

// Validar entrada
try {
  const datosValidados = CalcularCostoFichaSchema.parse({ fichaId: 1 });
  console.log('✅ Datos válidos:', datosValidados);
} catch (error) {
  console.error('❌ Error de validación:', error);
}

// Validar movimiento
try {
  const movimiento = InsertarMovimientoSchema.parse({
    tipoMovimiento: 'entrada',
    referenciaType: 'COMPRA',
    referenciaId: 123,
    cantidad: 100,
    motivo: 'Compra de telas',
    materialId: 5
  });
  console.log('✅ Movimiento válido');
} catch (error) {
  console.error('❌ Error:', error.errors);
}

// ============================================================================
// 7. PATRONES COMUNES DE ERROR HANDLING
// ============================================================================

// Patrón 1: Try-catch en service
async function seguridadService() {
  try {
    const resultado = await inventarioService.registrarEntrada({
      productoId: 1,
      almacenId: 1,
      cantidad: 100,
      motivo: 'Test',
      tipoReferencia: 'COMPRA',
      referenciaId: 1
    });
    return { success: true, data: resultado };
  } catch (error) {
    console.error('Error registrando entrada:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

// Patrón 2: API con validación
async function registrarMovimientoAPI(request: Request) {
  try {
    const body = await request.json();
    
    // Validar
    const datosValidados = InsertarMovimientoSchema.parse(body);
    
    // Procesar
    const resultado = await inventarioService.registrarSalida(datosValidados);
    
    // Responder
    return new Response(
      JSON.stringify({ success: true, data: resultado }),
      { status: 201 }
    );
  } catch (error) {
    if (error.name === 'ZodError') {
      return new Response(
        JSON.stringify({ error: 'Validación fallida', details: error.errors }),
        { status: 400 }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500 }
    );
  }
}

// ============================================================================
// 8. CONSULTAS AVANZADAS
// ============================================================================

// ✅ Filtrar movimientos por rango de fechas
async function consultarMovimientos(filtros: {
  tipoMovimiento?: 'entrada' | 'salida' | 'ajuste';
  fechaInicio?: Date;
  fechaFin?: Date;
  almacenId?: number;
}) {
  const response = await fetch('/api/admin/inventario-rpc', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tipoMovimiento: filtros.tipoMovimiento,
      fechaInicio: filtros.fechaInicio?.toISOString(),
      fechaFin: filtros.fechaFin?.toISOString(),
      almacenId: filtros.almacenId,
      limit: 100
    })
  });

  const { data } = await response.json();
  return data;
}

// Uso:
const movimientosHoy = await consultarMovimientos({
  tipoMovimiento: 'entrada',
  fechaInicio: new Date(),
  fechaFin: new Date(Date.now() + 86400000),
  almacenId: 1
});

// ============================================================================
// RESUMEN RÁPIDO
// ============================================================================

/*
FICHAS TÉCNICAS:
  GET  /api/admin/fichas-tecnicas-rpc?id=1
  POST /api/admin/fichas-tecnicas-rpc
  PUT  /api/admin/fichas-tecnicas-rpc?id=1

INVENTARIO:
  GET  /api/admin/inventario-rpc?tipo=producto&id=1
  POST /api/admin/inventario-rpc (entrada/salida/ajuste)
  PUT  /api/admin/inventario-rpc (filtrar movimientos)

NOTIFICACIONES:
  GET  /api/admin/notificaciones-rpc?usuarioId=1
  POST /api/admin/notificaciones-rpc
  PUT  /api/admin/notificaciones-rpc?action=marcar-leida
  DELETE /api/admin/notificaciones-rpc

AUDITORÍA:
  GET  /api/admin/auditoria-operaciones-rpc?action=reciente
  POST /api/admin/auditoria-operaciones-rpc (operaciones)
*/

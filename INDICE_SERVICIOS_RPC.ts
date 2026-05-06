/**
 * ÍNDICE MAESTRO DE SERVICIOS RPC DISPONIBLES
 * Referencia completa de todas las funciones implementadas
 */

// ============================================================================
// 📦 HELPERS RPC (rpc-helpers.ts)
// ============================================================================

/**
 * Calcula costo de ficha técnica usando RPC
 * - Suma costo de materiales (con desperdicio)
 * - Suma costo de insumos
 * - Actualiza campo costo_estimado en BD
 */
calcularCostoFicha(params: { fichaId: number }): Promise<number>

/**
 * Crea reserva de stock con validación
 * - Valida disponibilidad considerando reservas activas
 * - Crea registro con expiración de 48h
 * - Retorna cantidad reservada y disponible
 */
crearReservaStock(params: CrearReservaStockParams): Promise<CrearReservaStockResult>

/**
 * Actualiza precio de producto con histórico
 * - Registra precio anterior y nuevo
 * - Calcula porcentaje de cambio
 * - Guarda razón del cambio y usuario
 */
actualizarPrecioConHistorico(params: ActualizarPrecioParams): Promise<ActualizarPrecioResult>

/**
 * Inserta movimiento de inventario
 * - Registra entrada, salida o ajuste
 * - Asocia a referencia (compra, venta, orden)
 * - Disponible para triggers
 */
insertarMovimiento(params: InsertarMovimientoParams): Promise<void>

/**
 * Obtiene stock disponible considerando reservas
 * - Stock actual
 * - Reservas activas
 * - Disponible (actual - reservas)
 */
obtenerStockDisponible(productoId: number, almacenId: number): Promise<StockInfo>

/**
 * Registra cambio de estado en confección
 * - Guarda estado anterior y nuevo
 * - Mantiene histórico de transiciones
 */
registrarCambioEstadoConfeccion(
  confeccionId: number,
  estadoAnterior: string,
  estadoNuevo: string,
  notasCambio?: string
): Promise<void>

/**
 * Obtiene histórico de cambios de tabla
 * - Quién cambió, cuándo, antes y después
 * - Ordenado por fecha descendente
 */
obtenerAuditoriaRegistro(tabla: string, registroId: number): Promise<Auditoria[]>

/**
 * Crea notificación para usuario
 * - Tipo de notificación
 * - Asocia a referencia opcional
 * - URL de destino para click
 */
crearNotificacion(data: CrearNotificacionData): Promise<Notificacion>

/**
 * Obtiene notificaciones no leídas
 * - Filtro: usuario_id y leido=false
 * - Ordenado por fecha descendente
 */
obtenerNotificacionesNoLeidas(usuarioId: number): Promise<Notificacion[]>

/**
 * Marca notificaciones como leídas
 * - Puede ser una o múltiples
 * - Actualiza timestamp leido_at
 */
marcarNotificacionesComoLeidas(usuarioId: number, notificacionesIds?: number[]): Promise<void>

/**
 * Obtiene histórico de precios de producto
 * - Precio anterior, nuevo, porcentaje
 * - Usuario que hizo cambio
 * - Razón del cambio
 */
obtenerHistoricoPrecio(productoId: number): Promise<PrecioHistorico[]>

/**
 * Valida si hay suficiente stock
 * - Compara cantidad con stock del producto
 * - Retorna boolean
 */
validarStockSuficiente(productoId: number, cantidad: number): Promise<boolean>

/**
 * Obtiene auditoría reciente del sistema
 * - Últimas N operaciones
 * - Incluye usuario y tabla
 */
obtenerAuditoriaReciente(limit: number = 50): Promise<Auditoria[]>

// ============================================================================
// 🛠️ SERVICES - FICHAS TÉCNICAS (fichas-tecnicas-rpc-service.ts)
// ============================================================================

/**
 * Obtiene ficha técnica completa con costo calculado
 * - Incluye detalles de materiales e insumos
 * - Calcula costo usando RPC
 * - Retorna: FichaTecnicaConDetalles
 */
obtenerFichaTecnica(fichaId: number): Promise<FichaTecnicaConDetalles | null>

/**
 * Crea ficha técnica nueva
 * - Crea cabecera y detalles
 * - Registra en auditoría
 * - Calcula costo automático
 */
crearFichaTecnica(input: CrearFichaTecnicaInput): Promise<FichaTecnicaConDetalles>

/**
 * Actualiza ficha técnica existente
 * - Puede cambiar detalles
 * - Recalcula costo
 * - Actualiza estado
 */
actualizarFichaTecnica(fichaId: number, input: ActualizarFichaTecnicaInput): Promise<FichaTecnicaConDetalles>

/**
 * Obtiene costo de ficha directamente
 * - Solo el número del costo
 * - Usa RPC calcularCostoFicha
 */
obtenerCostoFicha(fichaId: number): Promise<number>

/**
 * Aprueba una ficha técnica
 * - Cambia estado a "aprobada"
 * - Registra en auditoría
 */
aprobarFichaTecnica(fichaId: number, usuarioId: number): Promise<fichas_tecnicas>

/**
 * Marca ficha como obsoleta
 * - Cambia estado a "obsoleta"
 * - No afecta registros históricos
 */
marcarFichaComObsoleta(fichaId: number): Promise<fichas_tecnicas>

/**
 * Lista fichas de un producto
 * - Ordenadas por versión descendente
 * - Todas las versiones disponibles
 */
obtenerFichasPorProducto(productoId: number): Promise<fichas_tecnicas[]>

/**
 * Obtiene histórico de cambios en ficha
 * - Todas las auditorías de esa ficha
 * - Quién cambió qué y cuándo
 */
obtenerHistoricoFicha(fichaId: number): Promise<Auditoria[]>

/**
 * Valida que ficha tenga datos completos
 * - Producto asignado
 * - Descripción detallada
 * - Al menos un detalle de material/insumo
 */
validarFichaTecnica(fichaId: number): Promise<{ valida: boolean; errores: string[] }>

// ============================================================================
// 🛠️ SERVICES - INVENTARIO (inventario-rpc-service.ts)
// ============================================================================

/**
 * Obtiene stock de producto en todos los almacenes
 * - Por almacén
 * - Cantidad, mínimo, disponible
 */
obtenerStockProducto(productoId: number): Promise<StockPorAlmacen[]>

/**
 * Obtiene stock de insumo en todos los almacenes
 * - Por almacén
 * - Cantidad, mínimo, disponible
 */
obtenerStockInsumo(insumoId: number): Promise<StockPorAlmacen[]>

/**
 * Obtiene stock de material en todos los almacenes
 * - Por almacén
 * - Cantidad, mínimo, disponible
 */
obtenerStockMaterial(materialId: number): Promise<StockPorAlmacen[]>

/**
 * Registra entrada de inventario
 * - Entrada por compra, ajuste, devolución
 * - Actualiza automáticamente almacen_stock
 * - Registra en movimientos_inventario y RPC
 */
registrarEntrada(data: RegistrarEntradaData): Promise<movimientos_inventario>

/**
 * Registra salida de inventario
 * - Salida por venta, producción, transferencia
 * - Valida stock suficiente
 * - Registra en movimientos e inserta movimiento
 */
registrarSalida(data: RegistrarSalidaData): Promise<movimientos_inventario>

/**
 * Registra ajuste de inventario
 * - Ajuste positivo o negativo
 * - Calcula diferencia automáticamente
 * - Registra como entrada o salida según sea necesario
 */
registrarAjuste(data: RegistrarAjusteData): Promise<movimientos_inventario>

/**
 * Obtiene movimientos recientes de producto
 * - Últimos N movimientos
 * - Incluye usuario que hizo movimiento
 */
obtenerMovimientosProducto(productoId: number, limit?: number): Promise<MovimientoConDetalles[]>

/**
 * Filtra movimientos con criterios múltiples
 * - Por tipo, referencia, fecha, almacén
 * - Con paginación
 */
filtrarMovimientos(data: FiltrosMovimiento): Promise<MovimientoConDetalles[]>

/**
 * Obtiene resumen de movimientos por período
 * - Total entradas, salidas, ajustes
 * - Montos totales
 */
obtenerResumenMovimientos(data: { fechaInicio: Date; fechaFin: Date; almacenId?: number }): Promise<ResumenMovimientos>

/**
 * Detecta items con stock bajo
 * - Items cuyo stock está cerca del mínimo
 * - Alertas para reordenar
 */
obtenerItemsConStockBajo(almacenId?: number): Promise<ItemStockBajo[]>

// ============================================================================
// 🛠️ SERVICES - NOTIFICACIONES (notificaciones-rpc-service.ts)
// ============================================================================

/**
 * Crea notificación nueva
 * - Para usuario específico
 * - Tipo de notificación predefinida
 * - Con referencia opcional a recurso
 */
crearNotificacionNueva(input: CrearNotificacionInput): Promise<notificaciones>

/**
 * Obtiene notificaciones no leídas de usuario
 * - Ordenadas por fecha descendente
 * - Máximo 50 por defecto
 */
obtenerNoLeidas(usuarioId: number): Promise<notificaciones[]>

/**
 * Obtiene todas las notificaciones con paginación
 * - Incluye leídas y no leídas
 * - Con información del usuario
 */
obtenerNotificacionesUsuario(usuarioId: number, limit?: number, offset?: number): Promise<{ total: number; notificaciones: NotificacionConDetalles[] }>

/**
 * Marca una notificación como leída
 * - Actualiza timestamp leido_at
 */
marcarComoLeida(notificacionId: number): Promise<notificaciones>

/**
 * Marca múltiples notificaciones como leídas
 * - En una operación
 */
marcarVariasComoLeidas(notificacionIds: number[]): Promise<void>

/**
 * Marca TODAS las notificaciones como leídas
 * - Para un usuario específico
 */
marcarTodasComoLeidas(usuarioId: number): Promise<void>

/**
 * Elimina una notificación
 * - Elimina completamente
 */
eliminarNotificacion(notificacionId: number): Promise<void>

/**
 * Elimina múltiples notificaciones
 * - En una operación
 */
eliminarVariasNotificaciones(notificacionIds: number[]): Promise<void>

/**
 * Obtiene estadísticas de notificaciones
 * - Total de notificaciones
 * - No leídas
 * - Desglose por tipo
 */
obtenerEstadisticasNotificaciones(usuarioId: number): Promise<EstadisticasNotificaciones>

/**
 * EVENTOS AUTOMÁTICOS:
 */

// Notifica cuando cotización expira
notificarCotizacionExpirada(data: { cotizacionId: number; cotizacionNumero: string }): Promise<void>

// Notifica cuando hay devolución solicitada
notificarDevolucionSolicitada(data: { devolucionId: number; clienteId: number; productoNombre: string }): Promise<void>

// Notifica cuando stock está bajo
notificarStockBajo(data: { itemId: number; itemNombre: string; stockActual: number; stockMinimo: number; tipoItem: 'producto' | 'insumo' | 'material' }): Promise<void>

// Notifica pago pendiente a taller
notificarPagoPendiente(data: { confeccionId: number; tallerNombre: string; monto: number }): Promise<void>

// Notifica confección completada
notificarConfeccionCompletada(data: { confeccionId: number; pedidoId: number }): Promise<void>

// ============================================================================
// 🎯 API ENDPOINTS
// ============================================================================

/*
FICHAS TÉCNICAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GET  /api/admin/fichas-tecnicas-rpc?id=1
     → Obtiene ficha con costo calculado
     
POST /api/admin/fichas-tecnicas-rpc
     → Crea ficha técnica nueva
     
PUT  /api/admin/fichas-tecnicas-rpc?id=1
     → Actualiza ficha técnica

INVENTARIO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GET  /api/admin/inventario-rpc?tipo=producto&id=1
     → Obtiene stock por almacén
     
GET  /api/admin/inventario-rpc?action=bajo-stock
     → Obtiene items con stock bajo
     
POST /api/admin/inventario-rpc
     → Registra movimiento (entrada/salida/ajuste)
     
PUT  /api/admin/inventario-rpc
     → Filtra movimientos con criterios

NOTIFICACIONES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GET  /api/admin/notificaciones-rpc?usuarioId=1
     → Lista notificaciones con paginación
     
GET  /api/admin/notificaciones-rpc?usuarioId=1&action=no-leidas
     → Obtiene no leídas
     
GET  /api/admin/notificaciones-rpc?usuarioId=1&action=stats
     → Obtiene estadísticas
     
POST /api/admin/notificaciones-rpc
     → Crea notificación
     
PUT  /api/admin/notificaciones-rpc?action=marcar-leida
     → Marca como leída
     
PUT  /api/admin/notificaciones-rpc?action=marcar-todas-leidas
     → Marca todas como leídas
     
DELETE /api/admin/notificaciones-rpc
     → Elimina notificación(es)

AUDITORÍA Y OPERACIONES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GET  /api/admin/auditoria-operaciones-rpc?action=reciente
     → Auditoría reciente del sistema
     
GET  /api/admin/auditoria-operaciones-rpc?action=registro&tabla=fichas_tecnicas&registroId=1
     → Auditoría de un registro específico
     
POST /api/admin/auditoria-operaciones-rpc
     operacion=aprobar-ficha
     operacion=obsoleta-ficha
     operacion=notificar-cotizacion-expirada
     operacion=notificar-stock-bajo
     operacion=notificar-devolucion
     operacion=notificar-pago-taller
     operacion=notificar-confeccion-completada
*/

// ============================================================================
// 📝 SCHEMAS ZOD PARA VALIDACIÓN
// ============================================================================

// Enums
TipoMovimientoEnum: z.enum(["entrada", "salida", "ajuste"])
ReferenciaMovimientoEnum: z.enum(["COMPRA", "VENTA", "AJUSTE", "ORDEN", "PRODUCCION"])
TipoNotificacionEnum: z.enum([...])
EstadoConfeccionEnum: z.enum([...])
EstadoPedidoEnum: z.enum([...])

// Schemas principales
CalcularCostoFichaSchema
CrearReservaStockSchema
ActualizarPrecioSchema
InsertarMovimientoSchema
CrearNotificacionSchema
CambiarEstadoConfeccionSchema
OperacionStockSchema
FiltrosAuditoriaSchema

// ============================================================================
// 💾 IMPORTAR Y USAR
// ============================================================================

/*
// Helpers
import { 
  calcularCostoFicha,
  crearReservaStock,
  actualizarPrecioConHistorico,
  insertarMovimiento,
  // ... más funciones
} from '@/lib/helpers/rpc-helpers';

// Services
import fichasTecnicasService from '@/lib/services/fichas-tecnicas-rpc-service';
import inventarioService from '@/lib/services/inventario-rpc-service';
import notificacionesService from '@/lib/services/notificaciones-rpc-service';

// Schemas
import {
  CalcularCostoFichaSchema,
  CrearReservaStockSchema,
  // ... más schemas
} from '@/lib/schemas/rpc-schemas';

// APIs se llaman vía fetch desde frontend
const response = await fetch('/api/admin/fichas-tecnicas-rpc?id=1');
const { data } = await response.json();
*/

export default {
  // Helpers
  calcularCostoFicha,
  crearReservaStock,
  actualizarPrecioConHistorico,
  // ... resto de helpers

  // Services
  fichasTecnicasService,
  inventarioService,
  notificacionesService,
};

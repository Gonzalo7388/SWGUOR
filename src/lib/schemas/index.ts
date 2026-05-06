// Schemas
export { 
  notificacionBaseSchema,
  crearNotificacionSchema,
  type Notificacion,
  type CrearNotificacion,
  type TipoNotificacion,
} from './notificacionesSchema';

export {
  almacenBaseSchema,
  crearAlmacenSchema,
  type Almacen,
  type CrearAlmacen,
} from './almacenesSchema';

export {
  reservaStockBaseSchema,
  crearReservaSchema,
  type ReservaStock,
  type CrearReserva,
} from './reservaStockSchema';

export {
  precioHistoricoBaseSchema,
  crearPrecioHistoricoSchema,
  type PrecioHistorico,
  type CrearPrecioHistorico,
} from './precioHistoricoSchema';

export {
  pagoTallerBaseSchema,
  crearPagoTallerSchema,
  type PagoTaller,
  type CrearPagoTaller,
} from './pagosTalleresSchema';

export {
  tarifaTallerBaseSchema,
  crearTarifaTallerSchema,
  type TarifaTaller,
  type CrearTarifaTaller,
} from './tarifaTalleresSchema';

export {
  guiaRemisionBaseSchema,
  crearGuiaRemisionSchema,
  type GuiaRemision,
  type CrearGuiaRemision,
} from './guiasRemisionSchema';

export {
  ordenCompraBaseSchema,
  crearOrdenCompraSchema,
  type OrdenCompra,
  type CrearOrdenCompra,
} from './ordenesCompraSchema';

export {
  incidenciaBaseSchema,
  crearIncidenciaSchema,
  type Incidencia,
  type CrearIncidencia,
} from './incidenciasSchema';

export {
  asientoContableBaseSchema,
  crearAsientoContableSchema,
  type AsientoContable,
  type CrearAsientoContable,
  type DetalleAsiento,
} from './asientosContablesSchema';

export {
  auditoriaBaseSchema,
  type Auditoria,
} from './auditoriaSchema';

export {
  comprobanteBaseSchema,
  crearComprobanteSchema,
  type Comprobante,
  type CrearComprobante,
} from './comprobantesSchema';

export {
  pagoBaseSchema,
  crearPagoSchema,
  type Pago,
  type CrearPago,
} from './pagosSchema';

// ── RPC Schemas (Validación para funciones PostgreSQL RPC)
export {
  CalcularCostoFichaSchema,
  CrearReservaStockSchema,
  ActualizarPrecioSchema,
  InsertarMovimientoSchema,
  CrearNotificacionSchema,
  CambiarEstadoConfeccionSchema,
  OperacionStockSchema,
  FiltrosAuditoriaSchema,
  BuscarMovimientosSchema,
  BuscarNotificacionesSchema,
  PaginacionSchema,
  TipoMovimientoEnum,
  ReferenciaMovimientoEnum,
  TipoNotificacionEnum,
  EstadoConfeccionEnum,
  EstadoPedidoEnum,
} from './rpc-schemas';

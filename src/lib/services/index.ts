// ── Servicios de dominio ─────────────────────────────────────────────────────
export { notificacionesService } from './notificacionesService';
export { almacenesService }      from './almacenesService';
export { reservaStockService }   from './reservaStockService';
export { precioHistoricoService } from './precioHistoricoService';
export { pagosTalleresService }  from './pagosTalleresService';
export { tarifaTalleresService } from './tarifaTalleresService';
export { guiasRemisionService }  from './guiasRemisionService';
export { ordenesCompraService }  from './ordenesCompraService';
export { incidenciasService }    from './incidenciasService';
export { asientosContablesService } from './asientosContablesService';
export { auditoriaService }      from './auditoriaService';
export { comprobantesService }   from './comprobantesService';
export { pagosService }          from './pagosService';

// ── Servicios que usan Prisma directamente (sin RPC) ─────────────────────────
export { FichasTecnicasService } from './fichas-tecnicas-services';
export { InventarioService }     from './inventario-services';
export { ProductosService }      from './productos-services';

// ── RPC unificado ─────────────────────────────────────────────────────────────
// Todo lo que antes estaba en:
//   notificaciones-rpc-service.ts
//   fichas-tecnicas-rpc-service.ts
//   inventario-rpc-service.ts
//   movimientos-inventario-services.ts  (lógica RPC)
export {
  // Notificaciones
  crearNotificacion,
  obtenerNotificacionesNoLeidas,
  marcarNotificacionesComoLeidas,
  marcarTodasComoLeidas,
  notificarCotizacionExpirada,
  notificarDevolucionSolicitada,
  notificarStockBajo,
  notificarPagoPendiente,
  notificarConfeccionCompletada,

  // Fichas técnicas
  obtenerCostoFicha,
  obtenerFichaTecnicaConCosto,
  crearFichaTecnica,
  actualizarFichaTecnica,
  aprobarFichaTecnica,
  marcarFichaObsoleta,
  obtenerFichasPorProducto,
  obtenerHistoricoFicha,

  // Inventario — stock
  obtenerStockProducto,
  obtenerStockInsumo,
  obtenerStockMaterial,
  obtenerStockDisponibleProducto,
  validarStock,
  obtenerInsumosBajoStock,
  obtenerItemsConStockBajo,

  // Inventario — movimientos
  registrarMovimiento,
  listarMovimientos,
  obtenerResumenMovimientos,

  // Namespaces agrupados (alternativa)
  NotificacionesRPC,
  FichasTecnicasRPC,
  InventarioRPC,
} from './rpc-service';
// ── Servicios de dominio ─────────────────────────────────────────────────────
export { notificacionesService } from './notificaciones.service';
export { almacenesService } from './almacenes.service';
export { reservaStockService } from './reserva-stock.service';
export { precioHistoricoService } from './precio-historico.service';
export { pagosTalleresService } from './pagos-talleres.service';
export { tarifaTalleresService } from './tarifa-talleres.service';
export { guiasRemisionService } from './guias-remision.service';
export { ordenesCompraService } from './ordenes-compra.service';
export { incidenciasService } from './incidencias.service';
export { asientosContablesService } from './asientos-contables.service';
export { auditoriaService } from './auditoria.service';
export { comprobantesService } from './comprobantes.service';
export { pagosService } from './pagos.service';

// ── Servicios que usan Prisma directamente (sin RPC) ─────────────────────────
export { FichasTecnicasService } from './fichas-tecnicas.service';
export { InventarioService } from './inventario.service';
export { ProductosService } from './productos.service';

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
} from './rpc.service';
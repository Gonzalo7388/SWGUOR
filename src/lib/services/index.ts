// Services
export { notificacionesService } from './notificacionesService';
export { almacenesService } from './almacenesService';
export { reservaStockService } from './reservaStockService';
export { precioHistoricoService } from './precioHistoricoService';
export { pagosTalleresService } from './pagosTalleresService';
export { tarifaTalleresService } from './tarifaTalleresService';
export { guiasRemisionService } from './guiasRemisionService';
export { ordenesCompraService } from './ordenesCompraService';
export { incidenciasService } from './incidenciasService';
export { asientosContablesService } from './asientosContablesService';
export { auditoriaService } from './auditoriaService';
export { comprobantesService } from './comprobantesService';
export { pagosService } from './pagosService';

// RPC Services (integración con PostgreSQL RPC)
export { FichasTecnicasService } from './fichas-tecnicas-services';
export { InventarioService } from './inventario-services';
export { notificacionesService as NotificacionesRPCService } from './notificaciones-rpc-service';

// RPC Helpers (abstracción de funciones PostgreSQL)
export {
  calcularCostoFicha,
  crearReservaStock,
  actualizarPrecioConHistorico,
  insertarMovimiento,
  obtenerStockDisponible,
  registrarCambioEstadoConfeccion,
  obtenerAuditoriaRegistro,
  crearNotificacion,
  obtenerNotificacionesNoLeidas,
  marcarNotificacionesComoLeidas,
  obtenerHistoricoPrecio,
  validarStockSuficiente,
  obtenerAuditoriaReciente,
} from '@/lib/helpers/rpc-helpers';

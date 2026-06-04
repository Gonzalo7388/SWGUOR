import 'dotenv/config';
import generarOrdenesParaPedidosPagados from '@/lib/helpers/generar-ordenes-pedidos-pagados.helper';

async function main() {
  try {
    console.log('Buscando pedidos pagados en estado pendiente...');
    const resultado = await generarOrdenesParaPedidosPagados({ limite: 500 });
    console.log(`Procesados: ${resultado.length}`);
    for (const r of resultado) {
      console.log(JSON.stringify(r));
    }
    console.log('Proceso finalizado.');
    process.exit(0);
  } catch (err) {
    console.error('Error al generar órdenes:', err);
    process.exit(1);
  }
}

main();

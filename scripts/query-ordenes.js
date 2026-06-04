require('dotenv').config();
const { Pool } = require('pg');

(async () => {
  const conn = (process.env.DATABASE_URL || process.env.DIRECT_URL || '').replace('?pgbouncer=true', '');
  if (!conn) {
    console.error('No DATABASE_URL');
    process.exit(2);
  }
  const pool = new Pool({ connectionString: conn });
  try {
    const res = await pool.query('SELECT COUNT(*) AS total FROM ordenes_produccion');
    console.log('TOTAL_ORDENES_PRODUCCION:', res.rows[0].total);
    const sample = await pool.query('SELECT id, producto_id, pedido_id, estado, created_at FROM ordenes_produccion ORDER BY created_at DESC LIMIT 5');
    console.log('SAMPLE_ROWS:', sample.rows);
  } catch (e) {
    console.error('ERROR', e.message || e);
    process.exitCode = 2;
  } finally {
    await pool.end();
  }
})();

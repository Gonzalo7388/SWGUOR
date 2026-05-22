import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const names = [
  'fn_actualizar_estado_por_stock',
  'fn_notificar_stock_bajo_producto',
  'update_updated_at_column',
];

for (const name of names) {
  const { rows } = await pool.query(
    `SELECT pg_get_functiondef(oid) AS def FROM pg_proc WHERE proname = $1 LIMIT 1`,
    [name],
  );
  console.log('\n==========', name, '==========');
  console.log(rows[0]?.def ?? 'NOT FOUND');
}

await pool.end();

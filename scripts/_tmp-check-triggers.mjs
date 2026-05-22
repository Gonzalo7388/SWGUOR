import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const { rows } = await pool.query(`
  SELECT tgname, pg_get_triggerdef(oid) AS def
  FROM pg_trigger
  WHERE tgrelid = 'public.productos'::regclass
    AND NOT tgisinternal
`);

for (const row of rows) {
  console.log('---', row.tgname);
  console.log(row.def);
}

await pool.end();

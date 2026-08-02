const { Client } = require('pg');
require('dotenv').config({ path: '../backend/.env' });

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  console.log('Conectando con cliente directo pg (Admin)...');
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  const prodRes = await client.query('SELECT count(*) FROM products;');
  console.log('Count products via direct PG admin connection:', prodRes.rows[0]);

  const rlsRes = await client.query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public';
  `);
  console.log('RLS Status per table:', rlsRes.rows);

  await client.end();
}

main().catch(err => console.error(err));

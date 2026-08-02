const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  console.log('Conectando a Supabase...');
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('¡Conectado exitosamente a PostgreSQL en Supabase!');

  const sqlPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Ejecutando script de creación de tablas...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS "cash_closures" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "closureNumber" TEXT NOT NULL UNIQUE,
        "closedBy" TEXT NOT NULL,
        "totalAmount" DECIMAL(65,30) NOT NULL,
        "totalTransactions" INTEGER NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'CLOSED',
        "reopenCount" INTEGER NOT NULL DEFAULT 0,
        "metadata" JSONB,
        "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log('✅ ¡Todas las tablas fueron creadas exitosamente en Supabase!');
  await client.end();
}

main().catch((err) => {
  console.error('❌ Error al aplicar el esquema:', err.message);
  process.exit(1);
});

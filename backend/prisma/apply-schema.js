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

  console.log('Ejecutando script de actualización de columnas e identificadores...');
  await client.query(`
    -- Re-asegurar defaults para ID y updatedAt
    ALTER TABLE IF EXISTS "sales" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
    ALTER TABLE IF EXISTS "sales" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

    ALTER TABLE IF EXISTS "sale_items" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

    ALTER TABLE IF EXISTS "cash_closures" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

    ALTER TABLE IF EXISTS "products" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
    ALTER TABLE IF EXISTS "products" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

    ALTER TABLE IF EXISTS "inventories" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
    ALTER TABLE IF EXISTS "inventories" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

    ALTER TABLE IF EXISTS "categories" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
    ALTER TABLE IF EXISTS "categories" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

    ALTER TABLE IF EXISTS "materials" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
    ALTER TABLE IF EXISTS "materials" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

    -- Habilitar replicación de Supabase Realtime para transmitir cambios al instante a todos los navegadores
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
      ELSE
        ALTER PUBLICATION supabase_realtime ADD TABLE "sales", "products", "inventories", "cash_closures", "sale_items", "categories", "materials";
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Silently ignore if already added
      NULL;
    END $$;
  `);
  
  console.log('✅ ¡Todas las tablas fueron creadas exitosamente en Supabase!');
  await client.end();
}

main().catch((err) => {
  console.error('❌ Error al aplicar el esquema:', err.message);
  process.exit(1);
});

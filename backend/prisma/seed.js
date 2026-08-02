require('dotenv/config');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Poblando base de datos de Supabase con datos de Laure Joyas...');

  // 1. Categorías
  const catAnillos = await prisma.category.upsert({
    where: { name: 'Anillos' },
    update: {},
    create: { name: 'Anillos', codePrefix: 'AN' },
  });

  const catAros = await prisma.category.upsert({
    where: { name: 'Aros' },
    update: {},
    create: { name: 'Aros', codePrefix: 'AR' },
  });

  const catCadenas = await prisma.category.upsert({
    where: { name: 'Cadenas' },
    update: {},
    create: { name: 'Cadenas', codePrefix: 'CD' },
  });

  const catDijes = await prisma.category.upsert({
    where: { name: 'Dijes' },
    update: {},
    create: { name: 'Dijes', codePrefix: 'DJ' },
  });

  const catPulseras = await prisma.category.upsert({
    where: { name: 'Pulseras' },
    update: {},
    create: { name: 'Pulseras', codePrefix: 'PU' },
  });

  const catAbridores = await prisma.category.upsert({
    where: { name: 'Abridores' },
    update: {},
    create: { name: 'Abridores', codePrefix: 'AB' },
  });

  // 2. Materiales
  const matPlata925 = await prisma.material.upsert({
    where: { name: 'Plata 925' },
    update: {},
    create: { name: 'Plata 925', codePrefix: 'PL' },
  });

  const matPlataOro = await prisma.material.upsert({
    where: { name: 'Plata y Oro Double' },
    update: {},
    create: { name: 'Plata y Oro Double', codePrefix: 'PO' },
  });

  const matAcero = await prisma.material.upsert({
    where: { name: 'Acero 316L' },
    update: {},
    create: { name: 'Acero 316L', codePrefix: 'AC' },
  });

  const matOro18 = await prisma.material.upsert({
    where: { name: 'Oro 18kts' },
    update: {},
    create: { name: 'Oro 18kts', codePrefix: 'OR' },
  });

  // 3. Sucursal
  const storeIsla = await prisma.store.upsert({
    where: { id: 'store-salsipuedes-isla' },
    update: {},
    create: {
      id: 'store-salsipuedes-isla',
      name: 'Salsipuedes (Isla 1)',
      address: 'Super Mami N°4 Salsipuedes',
    },
  });

  // 4. Usuarios
  await prisma.user.upsert({
    where: { email: 'adriana@laurejoyas.com.ar' },
    update: {},
    create: {
      email: 'adriana@laurejoyas.com.ar',
      name: 'Adriana (Dueña)',
      password: 'password123',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'martina@laurejoyas.com.ar' },
    update: {},
    create: {
      email: 'martina@laurejoyas.com.ar',
      name: 'Martina (Caja Salsipuedes)',
      password: 'password123',
      role: 'EMPLOYEE',
    },
  });

  // 5. Productos e Inventario
  const products = [
    {
      code: 'AN-PO-000001',
      name: 'Anillo Plata 925 con Detalle Oro Double 18k',
      description: 'Anillo artesanal de Plata 925 con lámina de oro double de 18kts. Diseño exclusivo de autor.',
      priceList: 50000,
      priceCash: 40000,
      categoryId: catAnillos.id,
      materialId: matPlataOro.id,
      stock: 5,
    },
    {
      code: 'CD-PL-000002',
      name: 'Cadena Plata 925 con Dije Sol Elegante',
      description: 'Cadena fina de Plata 925 de 45cm con dije pulido en forma de sol brillante.',
      priceList: 35000,
      priceCash: 28000,
      categoryId: catCadenas.id,
      materialId: matPlata925.id,
      stock: 8,
    },
    {
      code: 'AR-OR-000003',
      name: 'Abridores Oro 18kts Bolita N°3',
      description: 'Abridores hipoalergénicos de Oro 18kts macizo para bebé o niña, tuerca a rosca de seguridad.',
      priceList: 70000,
      priceCash: 56000,
      categoryId: catAbridores.id,
      materialId: matOro18.id,
      stock: 3,
    },
    {
      code: 'PU-AC-000004',
      name: 'Pulsera Acero 316L Grumetta',
      description: 'Pulsera de acero quirúrgico inalterable con cierre marinero reforzado.',
      priceList: 25000,
      priceCash: 20000,
      categoryId: catPulseras.id,
      materialId: matAcero.id,
      stock: 12,
    },
  ];

  for (const item of products) {
    const prod = await prisma.product.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        priceList: item.priceList,
        priceCash: item.priceCash,
      },
      create: {
        code: item.code,
        name: item.name,
        description: item.description,
        priceList: item.priceList,
        priceCash: item.priceCash,
        categoryId: item.categoryId,
        materialId: item.materialId,
      },
    });

    await prisma.inventory.upsert({
      where: {
        productId_storeId: {
          productId: prod.id,
          storeId: storeIsla.id,
        },
      },
      update: { quantity: item.stock },
      create: {
        productId: prod.id,
        storeId: storeIsla.id,
        quantity: item.stock,
      },
    });
  }

  console.log('✅ Base de datos de Supabase poblada con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error al poblar Supabase:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

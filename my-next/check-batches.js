const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkBatches() {
  try {
    console.log('Checking for batches...');
    const batches = await prisma.batch.findMany({
      include: {
        kitchen: true,
      }
    });
    
    console.log(`Found ${batches.length} batches:`);
    batches.forEach(batch => {
      console.log(`\nBatch ID: ${batch.id}`);
      console.log(`Kitchen ID: ${batch.kitchenId}`);
      console.log(`Supplier: ${batch.supplierName}`);
      console.log(`Status: ${batch.status}`);
      console.log(`Expires: ${batch.expiresAt}`);
      console.log(`Kitchen: ${batch.kitchen ? batch.kitchen.name : 'NULL/NOT FOUND'}`);
    });
    
    // Try to create a test batch
    const kitchens = await prisma.kitchen.findMany();
    if (kitchens.length > 0) {
      console.log('\n\nAttempting to create a test batch...');
      console.log('Using kitchen:', kitchens[0].id, kitchens[0].name);
      
      const testBatch = await prisma.batch.create({
        data: {
          kitchenId: kitchens[0].id,
          supplierName: 'Test Supplier Script',
          status: 'CREATED',
          expiresAt: new Date('2026-02-15T10:00:00Z'),
        },
        include: {
          kitchen: true,
        }
      });
      
      console.log('Test batch created successfully:', testBatch);
      
      // Clean up - delete test batch
      await prisma.batch.delete({ where: { id: testBatch.id } });
      console.log('Test batch deleted successfully');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    if (error.meta) {
      console.error('Meta:', JSON.stringify(error.meta, null, 2));
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkBatches();

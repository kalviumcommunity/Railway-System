// Check if QR code exists in database
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function checkQRCode() {
  try {
    console.log('🔍 Checking batches in database...\n')
    
    // Get all batches
    const batches = await prisma.batch.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        qrCode: true,
        foodItem: true,
        status: true,
        createdAt: true
      }
    })
    
    console.log(`📦 Total recent batches: ${batches.length}\n`)
    
    if (batches.length > 0) {
      console.log('Recent batches:')
      batches.forEach((b, i) => {
        console.log(`${i + 1}. QR: ${b.qrCode}`)
        console.log(`   Food: ${b.foodItem}, Status: ${b.status}`)
        console.log(`   Created: ${b.createdAt}\n`)
      })
    } else {
      console.log('⚠️  No batches found in database!\n')
    }
    
    // Check for the specific QR code
    const targetQR = 'QR-ec0e854e-1810-4d71-96a7-b3ed0a9c5e3f'
    const specificBatch = await prisma.batch.findUnique({
      where: { qrCode: targetQR },
      include: {
        kitchen: true
      }
    })
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`🎯 Looking for QR: ${targetQR}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    if (specificBatch) {
      console.log('✅ Found!')
      console.log(`   ID: ${specificBatch.id}`)
      console.log(`   Food: ${specificBatch.foodItem}`)
      console.log(`   Status: ${specificBatch.status}`)
      console.log(`   Kitchen: ${specificBatch.kitchen.name}`)
      console.log(`   Created: ${specificBatch.createdAt}`)
      console.log(`   Expires: ${specificBatch.expiresAt}`)
    } else {
      console.log('❌ NOT FOUND')
      console.log('   This QR code does not exist in the database.')
      console.log('\n💡 Possible reasons:')
      console.log('   1. The batch was never created')
      console.log('   2. The batch was deleted')
      console.log('   3. The QR code format is incorrect')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

checkQRCode()

// Simple script to test database connection
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...\n')
    
    // Test 1: Check connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test 2: Count users
    const userCount = await prisma.user.count()
    console.log(`📊 Users in database: ${userCount}`)
    
    // Test 3: Count kitchens
    const kitchenCount = await prisma.kitchen.count()
    console.log(`🍳 Kitchens in database: ${kitchenCount}`)
    
    // Test 4: Count batches
    const batchCount = await prisma.batch.count()
    console.log(`📦 Batches in database: ${batchCount}`)
    
    console.log('\n🎉 All tests passed! Your database is working correctly.')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

const { PrismaClient } = require('@prisma/client')
const { hashPassword } = require('../lib/password')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing data...')
  await prisma.complaint.deleteMany()
  await prisma.batchEvent.deleteMany()
  await prisma.batch.deleteMany()
  await prisma.kitchen.deleteMany()
  await prisma.user.deleteMany()

  // Create Users
  console.log('👥 Creating users...')
  const adminPassword = await hashPassword('admin123')
  const kitchenPassword = await hashPassword('kitchen123')
  const pantryPassword = await hashPassword('pantry123')

  const admin = await prisma.user.create({
    data: {
      email: 'admin@railway.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      active: true,
    },
  })
  console.log('✅ Created Admin:', admin.email)

  const kitchenHead = await prisma.user.create({
    data: {
      email: 'kitchen@railway.com',
      password: kitchenPassword,
      name: 'Kitchen Head',
      role: 'KITCHEN',
      active: true,
    },
  })
  console.log('✅ Created Kitchen Head:', kitchenHead.email)

  const pantryStaff = await prisma.user.create({
    data: {
      email: 'pantry@railway.com',
      password: pantryPassword,
      name: 'Pantry Staff',
      role: 'PANTRY',
      active: true,
    },
  })
  console.log('✅ Created Pantry Staff:', pantryStaff.email)

  // Create Kitchens
  console.log('🏢 Creating kitchens...')
  const kitchen1 = await prisma.kitchen.create({
    data: {
      name: 'Central Kitchen Delhi',
      status: 'ACTIVE',
    },
  })
  console.log('✅ Created Kitchen:', kitchen1.name)

  const kitchen2 = await prisma.kitchen.create({
    data: {
      name: 'Mumbai Base Kitchen',
      status: 'ACTIVE',
    },
  })
  console.log('✅ Created Kitchen:', kitchen2.name)

  const kitchen3 = await prisma.kitchen.create({
    data: {
      name: 'Bangalore Catering Unit',
      status: 'BLOCKED',
    },
  })
  console.log('✅ Created Kitchen:', kitchen3.name)

  // Create Batches with QR codes
  console.log('📦 Creating batches...')
  
  const batch1 = await prisma.batch.create({
    data: {
      kitchenId: kitchen1.id,
      supplierName: 'ABC Foods Pvt Ltd',
      foodItem: 'Veg Biryani',
      qrCode: 'QR-BIRYANI-001',
      status: 'CREATED',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    },
  })
  console.log('✅ Created Batch:', batch1.foodItem, '-', batch1.qrCode)

  const batch2 = await prisma.batch.create({
    data: {
      kitchenId: kitchen1.id,
      supplierName: 'XYZ Caterers',
      foodItem: 'Paneer Tikka Meals',
      qrCode: 'QR-PANEER-002',
      status: 'DISPATCHED',
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
    },
  })
  console.log('✅ Created Batch:', batch2.foodItem, '-', batch2.qrCode)

  const batch3 = await prisma.batch.create({
    data: {
      kitchenId: kitchen2.id,
      supplierName: 'Mumbai Meals Co',
      foodItem: 'Chicken Curry Rice',
      qrCode: 'QR-CHICKEN-003',
      status: 'RECEIVED',
      expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
    },
  })
  console.log('✅ Created Batch:', batch3.foodItem, '-', batch3.qrCode)

  const batch4 = await prisma.batch.create({
    data: {
      kitchenId: kitchen2.id,
      supplierName: 'Fresh Foods Inc',
      foodItem: 'Veg Thali',
      qrCode: 'QR-THALI-004',
      status: 'CREATED',
      expiresAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Expired 2 hours ago
    },
  })
  console.log('✅ Created Batch (Expired):', batch4.foodItem, '-', batch4.qrCode)

  // Create Batch Events
  console.log('📝 Creating batch events...')
  await prisma.batchEvent.create({
    data: {
      batchId: batch1.id,
      eventType: 'CREATED',
      actorRole: 'KITCHEN',
    },
  })

  await prisma.batchEvent.create({
    data: {
      batchId: batch2.id,
      eventType: 'DISPATCHED',
      actorRole: 'KITCHEN',
    },
  })

  await prisma.batchEvent.create({
    data: {
      batchId: batch3.id,
      eventType: 'RECEIVED',
      actorRole: 'PANTRY',
    },
  })
  console.log('✅ Created batch events')

  // Create Sample Complaints
  console.log('📋 Creating complaints...')
  await prisma.complaint.create({
    data: {
      batchId: batch2.id,
      trainNo: '12345',
      message: 'Passenger: John Doe\n\nFood was cold when served. Please ensure proper heating.',
    },
  })

  await prisma.complaint.create({
    data: {
      batchId: batch3.id,
      trainNo: '67890',
      message: 'The packaging was damaged and food quality was poor.',
    },
  })

  await prisma.complaint.create({
    data: {
      batchId: batch4.id,
      trainNo: '11111',
      message: 'Passenger: Jane Smith\n\nReceived expired food! Batch shows expiration date has passed.',
    },
  })
  console.log('✅ Created complaints')

  console.log('\n✨ Database seeded successfully!')
  console.log('\n📝 Login Credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👑 Admin:')
  console.log('   Email: admin@railway.com')
  console.log('   Password: admin123')
  console.log('\n🍳 Kitchen Head:')
  console.log('   Email: kitchen@railway.com')
  console.log('   Password: kitchen123')
  console.log('\n🥘 Pantry Staff:')
  console.log('   Email: pantry@railway.com')
  console.log('   Password: pantry123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n🎫 Sample QR Codes to test:')
  console.log('   QR-BIRYANI-001 (Active)')
  console.log('   QR-PANEER-002 (Dispatched)')
  console.log('   QR-CHICKEN-003 (Received)')
  console.log('   QR-THALI-004 (Expired - for testing)')
  console.log('\n🔗 Test complaint URL:')
  console.log('   http://localhost:3000/complaint/QR-BIRYANI-001')
  console.log('')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })

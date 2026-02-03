import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

// Load environment variables
import 'dotenv/config'

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const SALT_ROUNDS = 10

  // Create Admin user
  const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS)
  await prisma.user.upsert({
    where: { email: 'admin@railway.com' },
    update: {},
    create: {
      email: 'admin@railway.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      active: true,
    },
  })
  console.log('✅ Admin user created: admin@railway.com / admin123')

  // Create Kitchen user
  const kitchenPassword = await bcrypt.hash('kitchen123', SALT_ROUNDS)
  await prisma.user.upsert({
    where: { email: 'kitchen@railway.com' },
    update: {},
    create: {
      email: 'kitchen@railway.com',
      password: kitchenPassword,
      name: 'Kitchen User',
      role: 'KITCHEN',
      active: true,
    },
  })
  console.log('✅ Kitchen user created: kitchen@railway.com / kitchen123')

  // Create Pantry user
  const pantryPassword = await bcrypt.hash('pantry123', SALT_ROUNDS)
  await prisma.user.upsert({
    where: { email: 'pantry@railway.com' },
    update: {},
    create: {
      email: 'pantry@railway.com',
      password: pantryPassword,
      name: 'Pantry User',
      role: 'PANTRY',
      active: true,
    },
  })
  console.log('✅ Pantry user created: pantry@railway.com / pantry123')

  console.log('\n🎉 All test users seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

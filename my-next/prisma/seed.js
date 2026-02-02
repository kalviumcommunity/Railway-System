// Seed script to create demo users
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...\n')

  // Demo users
  const demoUsers = [
    {
      email: 'admin@railway.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'ADMIN',
    },
    {
      email: 'kitchen@railway.com',
      password: 'kitchen123',
      name: 'Kitchen Manager',
      role: 'KITCHEN',
    },
    {
      email: 'pantry@railway.com',
      password: 'pantry123',
      name: 'Pantry Staff',
      role: 'PANTRY',
    },
  ]

  for (const user of demoUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 10)
    
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    })

    if (existingUser) {
      console.log(`⚠️  User ${user.email} already exists, skipping...`)
      continue
    }

    await prisma.user.create({
      data: {
        email: user.email,
        password: hashedPassword,
        name: user.name,
        role: user.role,
      },
    })

    console.log(`✅ Created user: ${user.email} (${user.role})`)
  }

  console.log('\n🎉 Seeding completed!')
  console.log('\n📝 Demo Credentials:')
  demoUsers.forEach(user => {
    console.log(`   ${user.role.padEnd(10)} - ${user.email.padEnd(25)} / ${user.password}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
